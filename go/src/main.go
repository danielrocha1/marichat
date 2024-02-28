package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"

	"io"
	"io/ioutil"

<<<<<<< HEAD
=======

>>>>>>> e981b78 (enviando arquivos pdf e imagens)
	"log"
	"strings"
	"time"

<<<<<<< HEAD
<<<<<<< HEAD
	"net/http"
	"bytes"
=======
	"io/ioutil"

>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======

	"net/http"
	"bytes"
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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
<<<<<<< HEAD
<<<<<<< HEAD
	Label     string
=======
	Label		string
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
	Label     string
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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

	app.Post("/kickUser", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
<<<<<<< HEAD
			Type     string `json:"type"`
			Username string `json:"username"`
			RoomName string `json:"roomname"`
<<<<<<< HEAD
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
	

	app.Post("/sender", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
			Type      string    `json:"type"`
			Username  string    `json:"username"`
			RoomName  string    `json:"roomname"`
			Message   string    `json:"message"`
<<<<<<< HEAD
			Timestamp time.Time `json:"timestamp"`
=======
			Message  string `json:"message"`
			Timestamp time.Time `json:"timestamp"`

>>>>>>> 33eeb19 (sender e receivermessage com nome e hora)
=======
			Timestamp time.Time `json:"timestamp"`
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
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

<<<<<<< HEAD
<<<<<<< HEAD
		
		var requestData struct {
			Type      string    `json:"type"`
			Label     string    `json:"label"`
=======
		var requestData struct {
			Type      string    `json:"type"`
			Label  string    `json:"label"`
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
		
		var requestData struct {
			Type      string    `json:"type"`
			Label     string    `json:"label"`
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
			Username  string    `json:"username"`
			RoomName  string    `json:"roomname"`
			Message   string    `json:"message"`
			Upload    bool      `json:"upload"`
			Timestamp time.Time `json:"timestamp"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
<<<<<<< HEAD
<<<<<<< HEAD
				"error": "Failed to parse request body",
			})
		}

		// Constrói a mensagem
		message := MessageFile{
			Type: requestData.Type,
=======
				"error": "Falha ao fazer o parsing do corpo da requisição",
=======
				"error": "Failed to parse request body",
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
			})
		}

		// Constrói a mensagem
		message := MessageFile{
<<<<<<< HEAD
			Type:      requestData.Type,
			Label:	   requestData.Label,
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
			Type: requestData.Type,
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
			Name:      requestData.Username,
			Chatroom:  requestData.RoomName,
			Message:   requestData.Message,
			Upload:    requestData.Upload,
			Timestamp: time.Now(),
		}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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

<<<<<<< HEAD
=======
		// Verifica se existe um arquivo no corpo da requisição
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
		file, err := c.FormFile("file")
		if err == nil {
			// Lê o conteúdo do arquivo
			fileContent, err := file.Open()
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======

>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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
<<<<<<< HEAD
<<<<<<< HEAD
		

		}
		message.Label = mime
		// Serializa a mensagem para JSON
=======
		}

>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
		

		}
		message.Label = mime
		// Serializa a mensagem para JSON
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
		messageJSON, err := json.Marshal(message)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to serialize message data",
			})
		}

<<<<<<< HEAD
<<<<<<< HEAD
		fmt.Println(string(messageJSON))
=======
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======
		fmt.Println(string(messageJSON))
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
		// Envia a mensagem para todos os clientes WebSocket na sala de bate-papo
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				fmt.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}
<<<<<<< HEAD
<<<<<<< HEAD

		return nil // Retorna nil para indicar sucesso na resposta
=======
		return nil // retorno nil para indicar sucesso na resposta
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======

		return nil // Retorna nil para indicar sucesso na resposta
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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
<<<<<<< HEAD
<<<<<<< HEAD

			// Envia a mensagem para todos os clientes WebSocket, exceto o cliente atual
<<<<<<< HEAD
		for client := range clients {
		// Verifica se o cliente está presente no mapa de clientes
		if _, ok := clients[client]; !ok {
			// Se o cliente não estiver presente, registre um erro e pule para o próximo cliente
			log.Println("Cliente não autorizado tentando enviar mensagem.")
			continue
=======
=======
	
			fmt.Println("SEGUNDO", string(msg))
			// Enviar a mensagem para todos os clientes WebSocket, exceto o cliente atual
>>>>>>> 7f77aca (Enviando arquivos, como imagens e PDF)
=======

			// Envia a mensagem para todos os clientes WebSocket, exceto o cliente atual
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
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
>>>>>>> 896cfa7 (Status Digitando e mais informações na mensagem)
		}
<<<<<<< HEAD

		// Envia a mensagem para o cliente WebSocket
		err := client.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
			delete(clients, client) // Remove o cliente do mapa se houver um erro
			continue
		}
		fmt.Println(string(msg))
		}

		}
=======
>>>>>>> e981b78 (enviando arquivos pdf e imagens)
		
	}))
	
	// Inicializa o mapa de salas de bate-papo
	chatrooms = make(map[string]*Chatroom)

	// Inicia o servidor
	app.Listen(":8080")

	
}


