package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	// "io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Chatroom struct {
	Name  string
	Users []string
	HostID string
	ChatID string
}

type MessageTyping struct {
	User     string `json:"user"`
	IsTyping bool   `json:"isTyping"`
}

type Message struct {
	Type      string
	Name      string
	Message   string
	Chatroom  string
	Timestamp time.Time
}

type MessageFile struct {
	Type      string
	Label     string
	Name      string
	Message   string
	Chatroom  string
	Upload    bool `json:"upload"`
	Timestamp time.Time
	File      []byte `json:"file,omitempty"`
}

type WebSocketMessage struct {
	Sender  string `json:"sender"`
	Message string `json:"message"`
}

var chatrooms map[string]*Chatroom
var clients = make(map[*websocket.Conn]bool)

func detectFileType(reader io.Reader) (string, error) {
	// Lê os primeiros 512 bytes para determinar o tipo MIME
	buffer := make([]byte, 512)
	_, err := reader.Read(buffer)
	if err != nil && err != io.EOF {
		return "", err
	}

	// Detecta o tipo MIME
	mime := http.DetectContentType(buffer)

	return mime, nil
}

func main() {
	app := fiber.New()

	// Middleware para adicionar headers comuns a todas as rotas
	app.Use(func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")              // Define o header CORS para permitir acesso de qualquer origem
		c.Set("Access-Control-Allow-Methods", "POST, OPTIONS") // Define os métodos permitidos
		c.Set("Access-Control-Allow-Headers", "Content-Type")  // Define os headers permitidos
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusOK) // Responde com OK para solicitações OPTIONS
		}
		return c.Next()
	})

	// Rota WebSocket
	app.Get("/websocket", websocket.New(func(c *websocket.Conn) {
		// Adiciona o cliente ao mapa de clientes
		clients[c] = true

		// Fecha a conexão e remove o cliente do mapa ao encerrar
		defer func() {
			delete(clients, c)
			c.Close()
		}()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Erro ao ler mensagem:", err)
				break
			}

			// Envia a mensagem para todos os clientes WebSocket, exceto o cliente atual
			for client := range clients {
				if client != c {
					err := client.WriteMessage(websocket.TextMessage, msg)
					if err != nil {
						log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
						delete(clients, client) // Remove o cliente do mapa se houver um erro
						continue
					}
				}
			}
		}
	}))
	
	app.Get("/chatrooms", func(c *fiber.Ctx) error {
		var requestData struct {
			HostID 	 string `json:"hostid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}
		chatroomNames := make([]*Chatroom, 0, len(chatrooms))
		for _, chatRoom := range chatrooms {
			if requestData.HostID == chatRoom.HostID {
				chatroomNames = append(chatroomNames, chatRoom)
			}
			
		}
		return c.JSON(chatroomNames)
	})
	

	// Rota para adicionar usuário a uma sala de bate-papo
	app.Post("/adduser", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			Username string `json:"username"`
			RoomName string `json:"roomname"`
			HostID 	 string `json:"hostid"`
			ChatID 	 string `json:"chatid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.ChatID]
		if !exists {
			// Se não existir, cria uma nova sala de bate-papo
			chatroom = &Chatroom{
				Name:   requestData.RoomName,
				Users:  []string{requestData.Username},
				HostID: requestData.HostID,
			}
			chatrooms[requestData.RoomName] = chatroom
		} else {
			if chatroom.HostID != requestData.HostID {
				// Se o ID do host for diferente, cria um novo chat com o mesmo nome
				newRoomName := requestData.RoomName + "_" + requestData.HostID
				newChatroom := &Chatroom{
					Name:   newRoomName,
					Users:  []string{requestData.Username},
					HostID: requestData.HostID,
				}
				chatrooms[newRoomName] = newChatroom
			} else {
				// Se o ID do host for o mesmo, apenas adicione o usuário à sala de bate-papo existente
				chatroom.Users = append(chatroom.Users, requestData.Username)
			}
		}
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "newUser",
			"user":     requestData.Username,
			"chatRoom": requestData.RoomName,
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize user data",
			})
		}

		// Envia a mensagem para todos os clientes WebSocket informando sobre o novo usuário
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, userJSON)
			if err != nil {
				log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}

		return nil // retorno nil para indicar sucesso na resposta
	})
	app.Post("/kickuser", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			Username string `json:"username"`
			RoomName string `json:"roomname"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}
	
		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.RoomName]
		if !exists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}
	
		// Remove o usuário da sala de bate-papo
		var updatedUsers []string
		for _, user := range chatroom.Users {
			if user != requestData.Username {
				updatedUsers = append(updatedUsers, user)
			}
		}
		chatroom.Users = updatedUsers
	
		// Envia uma mensagem informando aos clientes WebSocket sobre a remoção do usuário
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "removeUser",
			"user":     requestData.Username,
			"chatRoom": requestData.RoomName,
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize user data",
			})
		}
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, userJSON)
			if err != nil {
				log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}
	
		// Retorna uma resposta indicando sucesso
		return c.SendStatus(fiber.StatusOK)
	})

	// Rota para enviar mensagem
	app.Post("/sender", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			Type      string    `json:"type"`
			Username  string    `json:"username"`
			RoomName  string    `json:"roomname"`
			Message   string    `json:"message"`
			Timestamp time.Time `json:"timestamp"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.RoomName]
		if !exists {
			// Se não existir, retorna um erro
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		// Constrói a mensagem
		message := Message{
			Type:      requestData.Type,
			Name:      requestData.Username,
			Message:   requestData.Message,
			Chatroom:  chatroom.Name,
			Timestamp: time.Now(),
		}

		// Envia a mensagem para todos os clientes WebSocket na sala de bate-papo
		messageJSON, err := json.Marshal(message)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize message data",
			})
		}

		// Envia a mensagem para todos os clientes WebSocket na sala de bate-papo
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}

		return nil // retorno nil para indicar sucesso na resposta
	})

	// Rota para enviar arquivo
	app.Post("/upload", func(c *fiber.Ctx) error {
		var requestData struct {
			Type      string    `json:"type"`
			Label     string    `json:"label"`
			Username  string    `json:"username"`
			RoomName  string    `json:"roomname"`
			Message   string    `json:"message"`
			Upload    bool      `json:"upload"`
			Timestamp time.Time `json:"timestamp"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		_, exists := chatrooms[requestData.RoomName]
		if !exists {
			// Se não existir, retorna um erro
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		// Constrói a mensagem
		message := MessageFile{
			Type:      requestData.Type,
			Label:     requestData.Label,
			Name:      requestData.Username,
			Message:   requestData.Message,
			Chatroom:  requestData.RoomName,
			Upload:    requestData.Upload,
			Timestamp: time.Now(),
		}

		// Decodifica a string base64
		data, err := base64.StdEncoding.DecodeString(strings.Split(requestData.Message, ",")[1])
		if err != nil {
			fmt.Println("Erro ao decodificar a string base64:", err)
			return err
		}

		// Cria um leitor para os bytes decodificados
		reader := bytes.NewReader(data)

		// Detecta o tipo MIME do arquivo
		_, err = detectFileType(reader)
		if err != nil {
			fmt.Println("Erro ao detectar o tipo MIME do arquivo:", err)
			return err
		}

		// Adiciona os bytes do arquivo à mensagem
		message.File = data

		// Serializa a mensagem para JSON
		messageJSON, err := json.Marshal(message)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize message data",
			})
		}

		// Envia a mensagem para todos os clientes WebSocket na sala de bate-papo
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				fmt.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}

		return nil // Retorna nil para indicar sucesso na resposta
	})

	// Rota para listar usuários de uma sala de bate-papo
	app.Post("/listusers", func(c *fiber.Ctx) error {
		// Obtém o nome da sala de bate-papo da URL
		var requestData struct {
			ChatID string `json:"chatid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		room, exists := chatrooms[requestData.ChatID]
		if !exists {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		return c.JSON(fiber.Map{
			"roomname": room.Name,
			"users":    room.Users,
		})
	})

	// Inicializa o mapa de salas de bate-papo
	chatrooms = make(map[string]*Chatroom)

	// Inicia o servidor na porta 8080
	app.Listen(":8080")
}
