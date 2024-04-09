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

	"database/sql"
	_ "github.com/lib/pq"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Users struct {
	Name   string `json:"username"`
	ChatID string `json:"chatid"`
	HostID string `json:"hostid"`
}

type Chatroom struct {
	Name   string
	Users  []Users
	HostID string
	ChatID string
}

type MessageTyping struct {
	User     string `json:"username"`
	HostID 	string  `json:"hostid"`
	IsTyping bool   `json:"isTyping"`
}

type Message struct {
	Type      string
	Name      string
	Message   string
	Chatroom  string
	HostID  string    
	ChatID  string    
	Timestamp time.Time
}

type MessageFile struct {
	Type      string
	Label     string
	Name      string
	HostID	  string
	Message   string
	Chatroom  string
	ChatID	  string
	Upload    bool `json:"upload"`
	Timestamp time.Time
	File      []byte `json:"file,omitempty"`
}

var chatrooms map[string]*Chatroom
var clients = make(map[*websocket.Conn]bool)

const (
	host     = "dpg-cnqud2ol5elc73avrg70-a"
	port     = 5432
	user     = "dbchat_64th_user"
	password = "BSBwntDWKbri0cxMCWnFF3GnFvaa6IQ5"
	dbname   = "dbchat_64th"
)

type UserInfo struct {
	ID        int    `json:"id"`
	HostID    string `json:"hostid"`
	FullName  string `json:"fullname"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Birthdate string `json:"birthdate"`
}

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
	// Conectar-se ao banco de dados PostgreSQL
	connectionString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		panic(err)
	}
	defer db.Close()

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

	app.Post("/register", func(c *fiber.Ctx) error {
		// Estrutura para receber os dados do corpo da solicitação
		type RegisterRequest struct {
			HostID    string `json:"hostid"`
			FullName  string `json:"fullname"`
			Username  string `json:"username"`
			Email     string `json:"email"`
			Password  string `json:"password"`
			Birthdate string `json:"birthdate"`
			// Adicione outros campos conforme necessário
		}

		// Parsear os dados do corpo da solicitação para a estrutura RegisterRequest
		var registerReq RegisterRequest
		if err := c.BodyParser(&registerReq); err != nil {
			return err
		}

		// Executar a consulta SQL para inserir os dados do usuário na tabela UserInfo
		_, err := db.Exec("INSERT INTO Userinfo (hostid, fullname, username, email, password, birthdate) VALUES ($1, $2, $3, $4, $5, $6)",
			registerReq.HostID, registerReq.FullName, registerReq.Username, registerReq.Email, registerReq.Password, registerReq.Birthdate)
		if err != nil {
			return err
		}

		return c.SendString("Usuário registrado com  sucesso!")
	})

	app.Post("/login", func(c *fiber.Ctx) error {
		// Estrutura para receber os dados do corpo da solicitação
		type LoginRequest struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura LoginRequest
		var loginReq LoginRequest
		if err := c.BodyParser(&loginReq); err != nil {
			return err
		}

		// Executar a consulta SQL para verificar o login
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM Userinfo WHERE email = $1 AND password = $2", loginReq.Email, loginReq.Password).Scan(&count)
		if err != nil {
			return err
		}

		// Verificar se as credenciais estão corretas
		if count == 1 {
			// Credenciais válidas, retornar uma resposta de sucesso
			var userInfo UserInfo
			err := db.QueryRow("SELECT * FROM Userinfo WHERE email = $1", loginReq.Email).Scan(
				&userInfo.ID,
				&userInfo.FullName,				
				&userInfo.Username,
				&userInfo.Email,
				&userInfo.Password,
				&userInfo.Birthdate,
				&userInfo.HostID)

			if err != nil {
				return err // Trate o erro adequadamente
			}
			return c.JSON(userInfo)
		} else {
			// Credenciais inválidas, retornar uma resposta de erro
			return c.Status(fiber.StatusUnauthorized).SendString("Credenciais inválidas")
		}
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
	

	app.Post("/chatrooms", func(c *fiber.Ctx) error {
		var requestData struct {
			HostID string `json:"hostid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		type Chatroom struct {
			ID       string `json:"id"`
			RoomName string `json:"chatname"`
			ChatID   string `json:"chatid"`
			HostID   string `json:"hostid"`
			Active   bool   `json:"active"`
		}

		var chatrooms []Chatroom

		rows, err := db.Query("SELECT id, chatname, chatid, hostid, active FROM Chatrooms WHERE hostid = $1 AND active = $2", requestData.HostID, true)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to query database",
			})
		}
		defer rows.Close()

		for rows.Next() {
			var chatroom Chatroom
			err := rows.Scan(&chatroom.ID, &chatroom.RoomName, &chatroom.ChatID, &chatroom.HostID, &chatroom.Active)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to scan row from database",
				})
			}
			chatrooms = append(chatrooms, chatroom)
		}

		if err := rows.Err(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error iterating over rows",
			})
		}

		// Filter chatrooms by hostid
		chatroomsFiltered := make([]Chatroom, 0)
		for _, chatroom := range chatrooms {
			if chatroom.HostID == requestData.HostID {
				chatroomsFiltered = append(chatroomsFiltered, chatroom)
			}
		}

		return c.JSON(chatroomsFiltered)
	})

	app.Post("/addUser", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			ChatName string `json:"chatname"`
			Name     string `json:"username"`
			ChatID   string `json:"chatid"`
			HostID   string `json:"hostid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		fmt.Println(requestData)
		// Verifica se o chat existe
		chatroom, exists := chatrooms[requestData.ChatID]
		if !exists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		} else {
			requestData.ChatName = chatroom.Name
			// Verifica se o usuário já está na sala
			for _, users := range chatroom.Users {
				if user.HostID == users.HostID {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
						"error": "Usuário já está na sala",
					})
				}
			}
			// Se o usuário não estiver na sala, adiciona-o
			chatroom.Users = append(chatroom.Users, requestData)
		}

		// Adiciona o usuário à sala de bate-papo existente

		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "newUser",
			"username":     requestData.Name,
			"guestid": requestData.HostID,
			"chatid":     requestData.ChatID,
			"chatRoom": chatroom.Name,
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

	app.Post("/enterroom", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			ChatName string `json:"chatname"`
			Name     string `json:"username"`
			ChatID   string `json:"chatid"`
			HostID   string `json:"hostid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}
	
		// Verifica se o chat existe
		chatroom, exists := chatrooms[requestData.ChatID]
		if !exists {
			// Se o chat não existir, cria uma nova sala de chat e adiciona o usuário
			chatroom = &Chatroom{
				Name:   requestData.ChatName,
				HostID: requestData.HostID,
				ChatID: requestData.ChatID,
				Users: []Users{
					{Name: requestData.Name, ChatID: requestData.ChatID, HostID: requestData.HostID},
				},
			}
			chatrooms[requestData.ChatID] = chatroom
		} else {
			// Verifica se o usuário já está na sala
			for _, user := range chatroom.Users {
				if requestData.HostID == user.HostID {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
						"error": "Usuário já está na sala",
					})
				}
			}
			// Se o usuário não estiver na sala, adiciona-o
			chatroom.Users = append(chatroom.Users, Users{Name: requestData.Name, ChatID: requestData.ChatID, HostID: requestData.HostID})
		}
	
		// Serializa os dados do usuário para JSON
	
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "newUser",
			"username":     requestData.Name,
			"hostid": requestData.HostID,
			"chatid":     requestData.ChatID,
			"chatRoom": chatroom.Name,
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
	
		return c.JSON(fiber.Map{
			"message": "Usuário adicionado com sucesso à sala de chat",
		})
	})



	// Rota para adicionar usuário a uma sala de bate-papo
	app.Post("/createchat", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			Name     string `json:"username"`
			ChatName string `json:"chatname"`
			HostID   string `json:"hostid"`
			ChatID   string `json:"chatid"`
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
				Name: requestData.ChatName,
				Users: []Users{
					{Name: requestData.Name, ChatID: requestData.ChatID, HostID: requestData.HostID},
				},
				HostID: requestData.HostID,
				ChatID: requestData.ChatID,
			}
			chatrooms[requestData.ChatID] = chatroom

			_, err := db.Exec("INSERT INTO Chatrooms (chatname, chatid, hostid, active) VALUES ($1, $2, $3, $4)",
			requestData.ChatName, requestData.ChatID, requestData.HostID, true)
			if err != nil {
				return err
			}

		} else {
			if chatroom.ChatID == requestData.ChatID {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Chat Já criado",
				})
			} else if chatroom.HostID != requestData.HostID {
				// Se o ID do host for diferente, cria um novo chat com o mesmo nome
				newChatroom := &Chatroom{
					Name: requestData.ChatName,
					Users: []Users{
						{Name: requestData.Name, ChatID: requestData.ChatID, HostID: requestData.HostID},
					},
					HostID: requestData.HostID,
					ChatID: requestData.ChatID, // Mantendo o ChatID igual
				}
				chatrooms[requestData.ChatID] = newChatroom
				_, err := db.Exec("INSERT INTO Chatrooms (chatname, chatid, hostid, active) VALUES ($1, $2, $3, $4)",
			requestData.ChatName, requestData.ChatID, requestData.HostID, true)
			if err != nil {
				return err
			}
			} else {
				// Se o ID do host for o mesmo, apenas adicione o usuário à sala de bate-papo existente
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Chat já criado",
				})
			}
		}

	
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "newUser",
			"username":     requestData.Name,
			"guestid": requestData.HostID,
			"chatid":     requestData.ChatID,
			"chatRoom": chatroom.Name,
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
			HostID   string `json:"hostid"`
			ChatID   string `json:"chatid"`
			RoomName string `json:"chatname"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.ChatID]
		if !exists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		// Remove o usuário da sala de bate-papo
		var updatedUsers []Users
		for _, user := range chatroom.Users {
			if user.HostID != requestData.HostID {
				updatedUsers = append(updatedUsers, user)
			}
		}
		chatroom.Users = updatedUsers

		// Envia uma mensagem informando aos clientes WebSocket sobre a remoção do usuário
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "removeUser",
			"username":     requestData.Username,
			"hostid":   requestData.HostID,
			"chatRoom": requestData.RoomName,
			"chatid": requestData.ChatID,
			
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
			HostID  string    `json:"hostid"`
			RoomName  string    `json:"roomname"`
			ChatID  string    `json:"chatid"`
			Message   string    `json:"message"`
	
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.ChatID]
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
			HostID:      requestData.HostID,
			ChatID:      requestData.ChatID,
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
			HostID  string    `json:"hostid"`
			ChatID  string    `json:"chatid"`
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
		_, exists := chatrooms[requestData.ChatID]
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
			HostID:      requestData.HostID,
			Message:   requestData.Message,
			ChatID:  requestData.ChatID,
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

		// Adiciona os bytes do arquivo à mensagem
		message.File = data
		message.Label = mime

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
