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

	"github.com/google/uuid"

	"database/sql"

	_ "github.com/lib/pq"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Users struct {
	Name     string `json:"username"`
	ChatID   string `json:"chatid"`
	HostID   string `json:"hostid"`
	PhotoURL []byte `json:"photo"`
}

type Chatroom struct {
	Name       string
	Users      []Users
	ChatHostID string
	HostID     string
	ChatID     string
	Private    bool
}

type MessageTyping struct {
	User     string `json:"username"`
	HostID   string `json:"hostid"`
	IsTyping bool   `json:"isTyping"`
}

type Message struct {
	Type      string
	Name      string
	Message   string
	Chatroom  string
	HostID    string
	ChatID    string
	Timestamp time.Time
}

type MessageFile struct {
	Type      string
	Label     string
	Name      string
	HostID    string
	Message   string
	Chatroom  string
	ChatID    string
	Upload    bool `json:"upload"`
	Timestamp time.Time
	File      []byte `json:"file,omitempty"`
}

var chatrooms map[string]*Chatroom
var clients = make(map[*websocket.Conn]bool)

const (
	host     = "dpg-cqcrlejv2p9s73e2ln9g-a"
	port     = 5432
	user     = "dbchat_87pu_user"
	password = "YIUhom6OSkDP6mY5vPqyp1i66hSzNPEL"
	dbname   = "dbchat_87pu"
)

type UserInfo struct {
	ID        int    `json:"id"`
	HostID    string `json:"hostid"`
	FullName  string `json:"fullname"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Birthdate string `json:"birthdate"`
	UserPhoto UserPhoto
}

type UserPhoto struct {
	ID    int    `json:"id"`
	Photo []byte `json:"photo"`
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

	app.Post("/friendRequest", func(c *fiber.Ctx) error {
		// Estrutura para receber os dados do corpo da solicitação
		type FriendRequest struct {
			HostID1 string `json:"hostid1"`
			HostID2 string `json:"hostid2"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura FriendRequest
		var friendRequest FriendRequest
		if err := c.BodyParser(&friendRequest); err != nil {
			return err
		}

		// Verificar se a solicitação de amizade já existe
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM friendships WHERE (hostid1 = $1 AND hostid2 = $2) OR (hostid1 = $2 AND hostid2 = $1)",
			friendRequest.HostID1, friendRequest.HostID2).Scan(&count)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao verificar solicitação de amizade",
			})
		}

		if count > 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Solicitação de amizade já existe",
			})
		}

		// Inserir a nova solicitação de amizade com timestamps
		now := time.Now()
		_, err = db.Exec("INSERT INTO friendships (hostid1, hostid2, status, created_at, updated_at) VALUES ($1, $2, 'pending', $3, $3)",
			friendRequest.HostID1, friendRequest.HostID2, now)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao criar solicitação de amizade",
			})
		}

		return c.SendString("Solicitação de amizade enviada com sucesso!")

	})

	app.Post("/selectfriendRequest", func(c *fiber.Ctx) error {
		// Estrutura para receber o usuário que está buscando os convites
		type RequestBody struct {
			HostID string `json:"hostid"`
		}

		// Estrutura para representar um usuário com foto e nome
		type User struct {
			HostID   string `json:"hostid"`
			Name     string `json:"name"`
			PhotoURL []byte `json:"photo_url"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura RequestBody
		var requestBody RequestBody
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Erro ao analisar o corpo da solicitação",
			})
		}

		// Prepare SQL query
		query := `
			SELECT hostid1 
			FROM friendships
			WHERE hostid2 = $1 
			 AND status = 'pending'
		`

		// Execute query
		rows, err := db.Query(query, requestBody.HostID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao executar a consulta",
			})
		}
		defer rows.Close()

		var hostIDs []string
		for rows.Next() {
			var hostid1 string
			if err := rows.Scan(&hostid1); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Erro ao ler os resultados da consulta",
				})
			}
			hostIDs = append(hostIDs, hostid1)
		}
		fmt.Println("hostid", hostIDs)

		if err := rows.Err(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao iterar sobre os resultados",
			})
		}

		var users []User

		for _, hostID := range hostIDs {
			userRow, err := db.Query(`
				SELECT up.photo, ui.username, ui.hostid
				FROM userphotos up
				JOIN userinfo ui ON up.hostid = ui.hostid
				WHERE up.hostid = $1`, hostID) // Use parameterized query
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to fetch user data",
				})
			}
			defer userRow.Close() // Close userRow immediately after it's executed

			for userRow.Next() {
				var user User
				if err := userRow.Scan(&user.PhotoURL, &user.Name, &user.HostID); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Erro ao ler os resultados da consulta de usuário",
					})
				}
				users = append(users, user)
			}

			if err := userRow.Err(); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Erro ao iterar sobre os resultados dos usuários",
				})
			}
		}

		// Retornar os detalhes dos usuários como JSON

		return c.JSON(users)
	})

	app.Post("/selectFriend", func(c *fiber.Ctx) error {
		// Estrutura para receber o usuário que está buscando os convites
		type RequestBody struct {
			HostID string `json:"hostid"`
		}

		// Estrutura para representar um usuário com foto e nome
		type User struct {
			HostID   string `json:"hostid"`
			Name     string `json:"name"`
			PhotoURL []byte `json:"photo_url"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura RequestBody
		var requestBody RequestBody
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Erro ao analisar o corpo da solicitação",
			})
		}

		// Prepare SQL query
		query := `
    SELECT hostid1
    FROM friendships
    WHERE hostid2 = $1
    AND status = 'accepted'
    UNION
    SELECT hostid2
    FROM friendships
    WHERE hostid1 = $1
    AND status = 'accepted'
`
		// Execute query
		rows, err := db.Query(query, requestBody.HostID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao executar a consulta",
			})
		}
		defer rows.Close()

		var hostIDs []string
		for rows.Next() {
			var hostid1 string
			if err := rows.Scan(&hostid1); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Erro ao ler os resultados da consulta",
				})
			}
			hostIDs = append(hostIDs, hostid1)
		}
		fmt.Println("hostid", hostIDs)

		if err := rows.Err(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao iterar sobre os resultados",
			})
		}

		var users []User

		for _, hostID := range hostIDs {
			userRow, err := db.Query(`
				SELECT up.photo, ui.username, ui.hostid, us.status
				FROM userphotos up
				JOIN userinfo ui ON up.hostid = ui.hostid
				JOIN user_status us ON ui.hostid = us.hostid
				WHERE up.hostid = $1`, hostID)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to fetch user data",
				})
			}
			defer userRow.Close() // Close userRow immediately after it's executed

			for userRow.Next() {
				var user User
				if err := userRow.Scan(&user.PhotoURL, &user.Name, &user.HostID); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Erro ao ler os resultados da consulta de usuário",
					})
				}
				users = append(users, user)
			}

			if err := userRow.Err(); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Erro ao iterar sobre os resultados dos usuários",
				})
			}
		}

		// Retornar os detalhes dos usuários como JSON

		return c.JSON(users)
	})

	app.Post("/acceptFriendRequest", func(c *fiber.Ctx) error {
		// Estrutura para receber o ID do usuário que está aceitando a amizade e o ID do solicitante
		type RequestBody struct {
			HostID   string `json:"hostid"`
			FriendID string `json:"friendid"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura RequestBody
		var requestBody RequestBody
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Erro ao analisar o corpo da solicitação",
			})
		}

		// Prepare SQL query para atualizar o status da amizade para 'accepted'
		query := `
			UPDATE friendships
			SET status = 'accepted'
			WHERE hostid1 = $1 AND hostid2 = $2 AND status = 'pending'
		`

		// Execute query
		result, err := db.Exec(query, requestBody.FriendID, requestBody.HostID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao atualizar o status da amizade",
			})
		}

		// Verificar se a linha foi atualizada
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao verificar as linhas afetadas",
			})
		}

		if rowsAffected == 0 {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Amizade não encontrada ou já aceita",
			})
		}

		// Retornar sucesso
		return c.JSON(fiber.Map{
			"message": "Amizade aceita com sucesso",
		})
	})

	app.Get("/select-user", func(c *fiber.Ctx) error {
		// Consulta SQL para obter os nomes das colunas da tabela userinfo
		query := "SELECT * FROM userinfo"

		// Executar o comando SQL para obter os dados
		rows, err := db.Query(query)
		if err != nil {
			log.Fatalf("Erro ao executar a consulta SQL: %v", err)
		}
		defer rows.Close()

		// Descobrir os nomes das colunas retornados pela consulta
		columns, err := rows.Columns()
		if err != nil {
			log.Fatalf("Erro ao obter os nomes das colunas: %v", err)
		}

		// Estrutura para armazenar os resultados
		var results []map[string]interface{}

		// Iterar sobre os resultados da consulta
		for rows.Next() {
			// Criar um slice de interface para armazenar os valores das colunas
			columnValues := make([]interface{}, len(columns))
			columnPointers := make([]interface{}, len(columns))
			for i := range columnValues {
				columnPointers[i] = &columnValues[i]
			}

			// Escanear as colunas na estrutura de interface
			err := rows.Scan(columnPointers...)
			if err != nil {
				log.Fatalf("Erro ao escanear linha: %v", err)
			}

			// Criar um mapa para armazenar os pares chave-valor (nome da coluna e valor)
			rowData := make(map[string]interface{})
			for i, col := range columns {
				val := columnPointers[i].(*interface{})
				rowData[col] = *val
			}

			// Adicionar os dados da linha ao slice de resultados
			results = append(results, rowData)
		}

		// Verificar por erros que podem ter ocorrido durante o percurso
		err = rows.Err()
		if err != nil {
			log.Fatalf("Erro ao percorrer linhas do resultado: %v", err)
		}

		// Retornar os resultados como resposta JSON
		return c.JSON(results)
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
		_, err := db.Exec("INSERT INTO userinfo (hostid, fullname, username, email, password, birthdate) VALUES ($1, $2, $3, $4, $5, $6)",
			registerReq.HostID, registerReq.FullName, registerReq.Username, registerReq.Email, registerReq.Password, registerReq.Birthdate)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Não foi possivel criar o cadastro",
			})
		}
		// Inserir uma nova foto para o hostid
		_, err = db.Exec("INSERT INTO userphotos (hostid, photo) VALUES ($1, $2)", registerReq.HostID, " ")
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
		err := db.QueryRow("SELECT COUNT(*) FROM userinfo WHERE email = $1 AND password = $2", loginReq.Email, loginReq.Password).Scan(&count)
		if err != nil {
			c.SendString("Usuário nao encontrado")
		}

		// Verificar se as credenciais estão corretas
		if count == 1 {
			// Credenciais válidas, retornar uma resposta de sucesso
			var userInfo UserInfo
			err := db.QueryRow("SELECT * FROM userinfo WHERE email = $1", loginReq.Email).Scan(
				&userInfo.ID,
				&userInfo.HostID,
				&userInfo.FullName,
				&userInfo.Username,
				&userInfo.Email,
				&userInfo.Password,
				&userInfo.Birthdate)

			if err != nil {
				c.SendString("Usuário nao encontrado 2")
			}

			err = db.QueryRow("SELECT id, photo FROM userphotos WHERE hostid = $1", userInfo.HostID).Scan(&userInfo.UserPhoto.ID, &userInfo.UserPhoto.Photo)
			if err != nil {
				c.SendString("Usuário nao encontrado 3")
			}
			fmt.Println(userInfo.UserPhoto)

			return c.JSON(userInfo)
		} else {
			// Credenciais inválidas, retornar uma resposta de erro
			return c.Status(fiber.StatusUnauthorized).SendString("Credenciais inválidas")
		}
	})

	app.Post("/upload-photo", func(c *fiber.Ctx) error {
		var photoReq struct {
			HostID string `json:"hostid"`
			Photo  []byte `json:"photo"`
		}

		// Parsear os dados do corpo da solicitação para a estrutura UserPhotoRequest
		if err := c.BodyParser(&photoReq); err != nil {
			return err
		}

		fmt.Println(photoReq.Photo)

		// Verificar se já existe uma foto para o hostid
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM userphotos WHERE hostid = $1", photoReq.HostID).Scan(&count)
		if err != nil {
			return err
		}

		if count == 1 {
			// Atualizar a foto para o hostid existente
			_, err = db.Exec("UPDATE userphotos SET photo = $1 WHERE hostid = $2", photoReq.Photo, photoReq.HostID)
			if err != nil {
				return err
			}
		} else {
			// Inserir uma nova foto para o hostid
			_, err = db.Exec("INSERT INTO userphotos (hostid, photo) VALUES ($1, $2)", photoReq.HostID, photoReq.Photo)
			if err != nil {
				return err
			}
		}

		return c.SendString("Foto enviada com sucesso!")
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

	app.Post("/publicchatrooms", func(c *fiber.Ctx) error {

		type Chatroom struct {
			ID       string `json:"id"`
			RoomName string `json:"chatname"`
			ChatID   string `json:"chatid"`
			HostID   string `json:"hostid"`
			Active   bool   `json:"active"`
		}

		var chatrooms []Chatroom

		rows, err := db.Query("SELECT id, chatname, chatid, hostid, active FROM Chatrooms WHERE private = false AND active = true")
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
			fmt.Println(chatroom)
			chatrooms = append(chatrooms, chatroom)
		}

		if err := rows.Err(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error iterating over rows",
			})
		}

		// Filter chatrooms by hostid

		return c.JSON(chatrooms)
	})

	app.Post("/addUser", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição

		type User struct {
			Name       string `json:"username"`
			ChatID     string `json:"chatid"`
			HostID     string `json:"hostid"`
			ChatHostID string `json:"chathostid"`
		}

		var user User

		if err := c.BodyParser(&user); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}
		fmt.Println(user)

		// Verifica se o chat existe
		chatroom, exists := chatrooms[user.ChatID]
		if !exists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Chatroom not found",
			})
		}

		// Verifica se o usuário já está na sala
		for _, existingUser := range chatroom.Users {
			if user.HostID == existingUser.HostID {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Usuário já está na sala",
				})
			}
		}

		// Busca a foto do perfil do usuário no banco de dados
		var photoURL []byte
		err := db.QueryRow("SELECT photo FROM userphotos WHERE hostid = $1", user.HostID).Scan(&photoURL)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(), // Retorna o erro como string
			})
		}

		// Serializa os dados do usuário para JSON
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":       "newUser",
			"username":   user.Name,
			"hostid":     user.HostID,
			"chatid":     user.ChatID,
			"chatHostID": user.ChatHostID,
			"chatRoom":   chatroom.Name,
			"photo":      photoURL, // Enviando os bytes da foto
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
			ChatName   string `json:"chatname"`
			Name       string `json:"username"`
			ChatID     string `json:"chatid"`
			ChatHostID string `json:"chathostid"`
			HostID     string `json:"hostid"`
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
			// Se o chat não existir, cria uma nova sala de chat e adiciona o usuário
			chatroom = &Chatroom{
				Name:       requestData.ChatName,
				HostID:     requestData.HostID,
				ChatID:     requestData.ChatID,
				ChatHostID: requestData.ChatHostID,
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

		// Busca a foto do perfil do usuário no banco de dados
		var photoURL []byte
		err := db.QueryRow("SELECT photo FROM userphotos WHERE hostid = $1", requestData.HostID).Scan(&photoURL)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(), // Retorna o erro como string
			})
		}

		// Serializa os dados do usuário para JSON
		userJSON, err := json.Marshal(map[string]interface{}{
			"type":     "newUser",
			"username": requestData.Name,
			"hostid":   requestData.HostID,
			"chatid":   requestData.ChatID,
			"chatRoom": chatroom.Name,
			"photo":    photoURL, // Enviando os bytes da foto
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
	app.Post("/deletechat", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			HostID string `json:"hostid"`
			ChatID string `json:"chatid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}
		_, err := db.Exec("UPDATE Chatrooms SET active = false WHERE chatid = $1 AND hostid = $2;",
			requestData.ChatID, requestData.HostID)
		if err != nil {
			return err
		}
		return c.SendStatus(fiber.StatusOK)
	})

	// Rota para adicionar usuário a uma sala de bate-papo
	app.Post("/createchat", func(c *fiber.Ctx) error {
		// Parse dos dados do corpo da requisição
		var requestData struct {
			UserName string `json:"username"`
			ChatName string `json:"chatname"`
			HostID   string `json:"hostid"`
			Private  bool   `json:"private"`
			ChatID   string `json:"chatid"`
		}
		if err := c.BodyParser(&requestData); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse request body",
			})
		}

		chatID, err := uuid.NewRandom()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate chat ID",
			})
		}

		// Converte o UUID para string
		requestData.ChatID = chatID.String()
		fmt.Println(requestData.ChatID)
		// Verifica se a sala de bate-papo existe
		chatroom, exists := chatrooms[requestData.ChatID]
		if !exists {
			// Se não existir, cria uma nova sala de bate-papo
			chatroom = &Chatroom{
				Name:    requestData.ChatName,
				Users:   []Users{},
				Private: requestData.Private,
				HostID:  requestData.HostID,
				ChatID:  requestData.ChatID,
			}
			chatrooms[requestData.ChatID] = chatroom

			_, err := db.Exec("INSERT INTO chatrooms (chatname, chatid, hostid, active, private) VALUES ($1, $2, $3, $4, $5)",
				requestData.ChatName, requestData.ChatID, requestData.HostID, true, requestData.Private)
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
					Name:    requestData.ChatName,
					Users:   []Users{},
					Private: requestData.Private,
					HostID:  requestData.HostID,
					ChatID:  requestData.ChatID, // Mantendo o ChatID igual
				}
				chatrooms[requestData.ChatID] = newChatroom
				_, err := db.Exec("INSERT INTO chatrooms (chatname, chatid, hostid, active, private) VALUES ($1, $2, $3, $4, $5)",
					requestData.ChatName, requestData.ChatID, requestData.HostID, true, requestData.Private)
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
			"username": requestData.ChatName,
			"guestid":  requestData.HostID,
			"chatid":   requestData.ChatID,
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
			"username": requestData.Username,
			"hostid":   requestData.HostID,
			"chatRoom": requestData.RoomName,
			"chatid":   requestData.ChatID,
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
			Type     string `json:"type"`
			Username string `json:"username"`
			HostID   string `json:"hostid"`
			RoomName string `json:"roomname"`
			ChatID   string `json:"chatid"`
			Message  string `json:"message"`
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
			HostID:    requestData.HostID,
			ChatID:    requestData.ChatID,
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
			HostID    string    `json:"hostid"`
			ChatID    string    `json:"chatid"`
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
			HostID:    requestData.HostID,
			Message:   requestData.Message,
			ChatID:    requestData.ChatID,
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
		fmt.Println(room.HostID)
		for i, user := range room.Users {

			rows, err := db.Query("SELECT photo FROM userphotos WHERE hostid = $1", user.HostID)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to fetch user photos",
				})
			}
			defer rows.Close()

			for rows.Next() {
				var photoURL []byte
				if err := rows.Scan(&photoURL); err != nil {
					return err
				}
				// Adicionar PhotoURL ao User correspondente
				room.Users[i] = Users{
					Name:     user.Name,
					HostID:   user.HostID,
					ChatID:   user.ChatID,
					PhotoURL: photoURL,
				}
			}
		}

		return c.JSON(fiber.Map{
			"roomname": room.Name,
			"chatHost": room.HostID,
			"users":    room.Users,
		})
	})

	//ENDPOINTS PARA DUMP E CRIAÇÃO DO DBA

	app.Get("/dump", func(c *fiber.Ctx) error {
		// Consulta para obter o nome de todas as tabelas no banco de dados
		tablesQuery := `
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
			ORDER BY table_name
		`

		// Executar a consulta para obter os nomes das tabelas
		tablesRows, err := db.Query(tablesQuery)
		if err != nil {
			log.Fatalf("Erro ao executar a consulta para obter tabelas: %v", err)
		}
		defer tablesRows.Close()

		// Slice para armazenar as informações das tabelas
		var tables []map[string]interface{}

		// Iterar sobre os resultados da consulta de tabelas
		for tablesRows.Next() {
			var tableName string
			err := tablesRows.Scan(&tableName)
			if err != nil {
				log.Fatalf("Erro ao escanear nome da tabela: %v", err)
			}

			// Consulta para obter informações das colunas da tabela
			columnsQuery := `
				SELECT column_name, data_type, column_default
				FROM information_schema.columns
				WHERE table_name = $1
				ORDER BY ordinal_position
			`

			// Executar a consulta para obter as colunas da tabela
			columnsRows, err := db.Query(columnsQuery, tableName)
			if err != nil {
				log.Fatalf("Erro ao executar a consulta para obter colunas da tabela %s: %v", tableName, err)
			}
			defer columnsRows.Close()

			// Slice para armazenar as informações das colunas
			var columns []map[string]interface{}

			// Iterar sobre os resultados da consulta de colunas
			for columnsRows.Next() {
				var columnName, dataType string
				var columnDefault sql.NullString
				err := columnsRows.Scan(&columnName, &dataType, &columnDefault)
				if err != nil {
					log.Fatalf("Erro ao escanear coluna da tabela %s: %v", tableName, err)
				}

				// Verificar se a coluna é auto incrementável
				isAutoIncrement := strings.Contains(strings.ToLower(columnDefault.String), "nextval")

				// Criar um mapa para armazenar as informações da coluna
				column := map[string]interface{}{
					"name":          columnName,
					"type":          dataType,
					"is_auto_inc":   isAutoIncrement,
					"default_value": columnDefault.String,
					"is_nullable":   columnDefault.Valid,
				}
				columns = append(columns, column)
			}

			// Criar um mapa para armazenar as informações da tabela
			tableInfo := map[string]interface{}{
				"table":   tableName,
				"columns": columns,
			}
			tables = append(tables, tableInfo)
		}

		// Retornar as informações das tabelas como resposta JSON
		return c.JSON(tables)
	})

	app.Post("/create-tables", func(c *fiber.Ctx) error {
		// Definição das tabelas e colunas diretamente no código
		tables := []struct {
			name    string
			columns []struct {
				name       string
				dataType   string
				isAutoInc  bool
				isNullable bool
			}
		}{
			{
				name: "chatrooms",
				columns: []struct {
					name       string
					dataType   string
					isAutoInc  bool
					isNullable bool
				}{
					{name: "id", dataType: "SERIAL", isAutoInc: true, isNullable: false},
					{name: "chatname", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "chatid", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "hostid", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "active", dataType: "BOOLEAN", isAutoInc: false, isNullable: false},
					{name: "private", dataType: "BOOLEAN", isAutoInc: false, isNullable: true},
				},
			},
			{
				name: "userinfo",
				columns: []struct {
					name       string
					dataType   string
					isAutoInc  bool
					isNullable bool
				}{
					{name: "id", dataType: "SERIAL", isAutoInc: true, isNullable: false},
					{name: "hostid", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "fullname", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "username", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "email", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "password", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "birthdate", dataType: "DATE", isAutoInc: false, isNullable: false},
				},
			},
			{
				name: "userphotos",
				columns: []struct {
					name       string
					dataType   string
					isAutoInc  bool
					isNullable bool
				}{
					{name: "id", dataType: "SERIAL", isAutoInc: true, isNullable: false},
					{name: "hostid", dataType: "VARCHAR", isAutoInc: false, isNullable: false},
					{name: "photo", dataType: "BYTEA", isAutoInc: false, isNullable: false},
				},
			},
		}

		// Iterar sobre as definições de tabela e criar cada uma no banco de dados
		for _, table := range tables {
			// Construir a declaração CREATE TABLE
			var createTableStmt strings.Builder
			createTableStmt.WriteString("CREATE TABLE IF NOT EXISTS ")
			createTableStmt.WriteString(table.name)
			createTableStmt.WriteString(" (")

			// Iterar sobre as colunas da tabela
			for i, col := range table.columns {
				createTableStmt.WriteString(col.name)
				createTableStmt.WriteString(" ")
				createTableStmt.WriteString(col.dataType)

				// Definir auto incremento se necessário
				if col.isAutoInc {
					createTableStmt.WriteString(" SERIAL")
				}

				// Definir NOT NULL se a coluna não permitir nulos
				if !col.isNullable {
					createTableStmt.WriteString(" NOT NULL")
				}

				// Adicionar vírgula para separar as colunas
				if i < len(table.columns)-1 {
					createTableStmt.WriteString(", ")
				}
			}

			// Adicionar chave primária se a tabela tiver coluna 'id'
			for _, col := range table.columns {
				if col.name == "id" {
					createTableStmt.WriteString(", PRIMARY KEY (id)")
					break
				}
			}

			// Fechar a declaração CREATE TABLE
			createTableStmt.WriteString(")")

			// Executar a declaração CREATE TABLE no banco de dados
			_, err := db.Exec(createTableStmt.String())
			if err != nil {
				return err
			}
		}

		// Retornar resposta de sucesso
		return c.SendStatus(fiber.StatusCreated)
	})

	app.Post("/friendships-tables", func(c *fiber.Ctx) error {
		// Definição das tabelas e colunas diretamente no código
		tables := []struct {
			name    string
			columns []struct {
				name       string
				dataType   string
				isAutoInc  bool
				isNullable bool
			}
		}{
			{
				name: "friendships",
				columns: []struct {
					name       string
					dataType   string
					isAutoInc  bool
					isNullable bool
				}{
					{name: "id", dataType: "SERIAL", isAutoInc: true, isNullable: false},
					{name: "hostid1", dataType: "VARCHAR(255)", isAutoInc: false, isNullable: false},
					{name: "hostid2", dataType: "VARCHAR(255)", isAutoInc: false, isNullable: false},
					{name: "status", dataType: "VARCHAR(20)", isAutoInc: false, isNullable: false},
					{name: "created_at", dataType: "TIMESTAMP", isAutoInc: false, isNullable: true},
					{name: "updated_at", dataType: "TIMESTAMP", isAutoInc: false, isNullable: true},
				},
			},
		}

		// Iterar sobre as definições de tabela e criar cada uma no banco de dados
		for _, table := range tables {
			// Construir a declaração CREATE TABLE
			var createTableStmt strings.Builder
			createTableStmt.WriteString("CREATE TABLE IF NOT EXISTS ")
			createTableStmt.WriteString(table.name)
			createTableStmt.WriteString(" (")

			// Iterar sobre as colunas da tabela
			for i, col := range table.columns {
				createTableStmt.WriteString(col.name)
				createTableStmt.WriteString(" ")
				createTableStmt.WriteString(col.dataType)

				// Definir NOT NULL se a coluna não permitir nulos
				if !col.isNullable {
					createTableStmt.WriteString(" NOT NULL")
				}

				// Adicionar vírgula para separar as colunas
				if i < len(table.columns)-1 {
					createTableStmt.WriteString(", ")
				}
			}

			// Adicionar chave primária se a tabela tiver coluna 'id'
			for _, col := range table.columns {
				if col.name == "id" {
					createTableStmt.WriteString(", PRIMARY KEY (id)")
					break
				}
			}

			// Adicionar chaves estrangeiras para 'hostid1' e 'hostid2'
			createTableStmt.WriteString(", CONSTRAINT fk_hostid1 FOREIGN KEY (hostid1) REFERENCES userinfo (hostid) ON DELETE CASCADE")
			createTableStmt.WriteString(", CONSTRAINT fk_hostid2 FOREIGN KEY (hostid2) REFERENCES userinfo (hostid) ON DELETE CASCADE")

			// Adicionar restrição de unicidade para o par de hostids
			createTableStmt.WriteString(", CONSTRAINT unique_pair UNIQUE (hostid1, hostid2)")

			// Fechar a declaração CREATE TABLE
			createTableStmt.WriteString(")")

			// Executar a declaração CREATE TABLE no banco de dados
			_, err := db.Exec(createTableStmt.String())
			if err != nil {
				return err
			}
		}

		// Retornar resposta de sucesso
		return c.SendStatus(fiber.StatusCreated)
	})

	app.Delete("/drop-userinfo", func(c *fiber.Ctx) error {
		// Executar o comando DROP TABLE
		_, err := db.Exec("DROP TABLE IF EXISTS userinfo")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Failed to drop table: %v", err))
		}

		// Responder com sucesso
		return c.SendString("Table userinfo dropped successfully.")
	})

	app.Post("/create-userinfo", func(c *fiber.Ctx) error {
		createTableSQL := `
        CREATE TABLE IF NOT EXISTS userinfo (
            id SERIAL PRIMARY KEY,
            hostid VARCHAR(255) UNIQUE NOT NULL,
            fullname VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            birthdate DATE NOT NULL
        );
        `

		_, err := db.Exec(createTableSQL)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Failed to create table: %v", err))
		}

		return c.SendString("Table 'userinfo' created successfully.")
	})
	// Inicializa o mapa de salas de bate-papo
	chatrooms = make(map[string]*Chatroom)

	// Inicia o servidor na porta 8080
	app.Listen(":8080")
}
