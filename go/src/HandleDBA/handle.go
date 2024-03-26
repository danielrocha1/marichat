package main

import (
    "fmt"
    "github.com/gofiber/fiber/v2"

)



func main() {
    // Conectar-se ao banco de dados PostgreSQL
    connectionString := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
    db, err := sql.Open("postgres", connectionString)
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // Criar uma nova instância do aplicativo Fiber
    app := fiber.New()

    // Rota para o endpoint de login
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
        err := db.QueryRow("SELECT COUNT(*) FROM UserInfo WHERE email = $1 AND password = $2", loginReq.Email, loginReq.Password).Scan(&count)
        if err != nil {
            return err
        }

        // Verificar se as credenciais estão corretas
        if count == 1 {
            // Credenciais válidas, retornar uma resposta de sucesso
            return c.SendString("Login bem-sucedido!")
        } else {
            // Credenciais inválidas, retornar uma resposta de erro
            return c.Status(fiber.StatusUnauthorized).SendString("Credenciais inválidas")
        }
    })

    // Iniciar o servidor na porta 3000
    app.Listen(":3000")
}
