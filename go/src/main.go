package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Chatroom struct {
	Name  string
	Users []string
}

type Message struct {
	Name      string
	Message   string
	Chatroom  string
	Timestamp time.Time
}

type WebSocketMessage struct {
	Sender  string `json:"sender"`
	Message string `json:"message"`
}

var chatrooms map[string]*Chatroom

var (
	clients = make(map[*websocket.Conn]bool) // Mapa para armazenar os clientes conectados
)

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
			"type": "newUser",
			"user": requestData.Username,
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
			Username string `json:"username"`
			RoomName string `json:"roomname"`
			Message  string `json:"message"`
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
			fmt.Println(string(messageJSON))
			err := client.WriteMessage(websocket.TextMessage, messageJSON)
			if err != nil {
				fmt.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
				continue
			}
		}

		return nil // retorno nil para indicar sucesso na resposta
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

			// Envia a mensagem para todos os clientes WebSocket
			for client := range clients {
				err := client.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					log.Println("Erro ao enviar mensagem para o cliente WebSocket:", err)
					delete(clients, client) // Remove o cliente do mapa se houver um erro
					continue
				}
			}
		}
	}))

	// Inicializa o mapa de salas de bate-papo
	chatrooms = make(map[string]*Chatroom)

	// Inicia o servidor
	app.Listen(":8080")
}
