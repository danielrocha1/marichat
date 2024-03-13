package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"

	"io"
	"io/ioutil"


	"log"
	"strings"
	"time"


	"net/http"
	"bytes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

)



type Chatroom struct {
	Name  string
	Users []string
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

	File []byte `json:"file,omitempty"`
}

type WebSocketMessage struct {
	Sender  string `json:"sender"`
	Message string `json:"message"`
}

var chatrooms map[string]*Chatroom

var (
	clients = make(map[*websocket.Conn]bool) // Mapa para armazenar os clientes conectados

)

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

	// Rota para adicionar usuário a uma sala de bate-papo
	app.Post("/adduser", func(c *fiber.Ctx) error {
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
			// Se não existir, cria uma nova sala de bate-papo
			chatroom = &Chatroom{
				Name:  requestData.RoomName,
				Users: []string{requestData.Username},
			}
			chatrooms[requestData.RoomName] = chatroom
		} else {
			// Adiciona o usuário à sala de bate-papo existente
			chatroom.Users = append(chatroom.Users, requestData.Username)
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

		fmt.Println(string(messageJSON))
		// Envia a mensagem para todos os clientes WebSocket na sala de bate-papo
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				fmt.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}

		return nil // retorno nil para indicar sucesso na resposta
	})

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

		// Constrói a mensagem
		message := MessageFile{
			Type: requestData.Type,
			Name:      requestData.Username,
			Chatroom:  requestData.RoomName,
			Message:   requestData.Message,
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
		mime, err := detectFileType(reader)
		if err != nil {
			fmt.Println("Erro ao detectar o tipo MIME do arquivo:", err)
			return err
		}
		
		fmt.Println("Tipo MIME do arquivo:", mime)

		file, err := c.FormFile("file")
		if err == nil {
			// Lê o conteúdo do arquivo
			fileContent, err := file.Open()

			if err != nil {
				log.Println("Erro ao abrir o arquivo:", err)
				return err
			}
			defer fileContent.Close()

			// Lê o conteúdo do arquivo
			fileBytes, err := ioutil.ReadAll(fileContent)
			if err != nil {
				log.Println("Erro ao ler o conteúdo do arquivo:", err)
				return err
			}

			// Adiciona os bytes do arquivo à mensagem
			message.File = fileBytes
		

		}
		message.Label = mime
		// Serializa a mensagem para JSON
		messageJSON, err := json.Marshal(message)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize message data",
			})
		}

		fmt.Println(string(messageJSON))
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

	app.Post("/listusers", func(c *fiber.Ctx) error {
		// Obtém o nome da sala de bate-papo da URL
		var requestData struct {
			RoomName string `json:"roomname"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		roomName, exists := chatrooms[requestData.RoomName]
		if !exists {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		return c.JSON(fiber.Map{
			"roomname": roomName.Name,
			"users":    roomName.Users,
		})
	})
	

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

			// Parse da mensagem WebSocket
			var wsMsg WebSocketMessage
			if err := json.Unmarshal(msg, &wsMsg); err != nil {
				log.Println("Erro ao fazer o unmarshal da mensagem:", err)
				continue
			}

			// Adiciona ou atualiza o cliente com o seu username no mapa de clientes
			clients[c] = true

			// Envia a mensagem para todos os clientes WebSocket, exceto o cliente atual
			for client := range clients {
				if client != c {
					err := client.WriteMessage(websocket.TextMessage, msg)
					if err != nil {
						log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
						delete(clients, client) // Remove o cliente do mapa se houver um erro
						continue
					}
					fmt.Println(string(msg))
				}
			}
		}
		
	}))
	
	// Inicializa o mapa de salas de bate-papo
	chatrooms = make(map[string]*Chatroom)

	// Inicia o servidor
	app.Listen(":8080")

	
}


