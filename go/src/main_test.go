package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "testing"
    "fmt"

    "github.com/gofiber/fiber/v2"
    "github.com/stretchr/testify/assert"
)

func TestAddUserToChatroom(t *testing.T) {
    // Inicializa o servidor
    app := setupServer()

    // Cria uma solicitação HTTP POST para adicionar um usuário a uma sala de bate-papo
    requestBody := `{"username": "user1", "roomname": "room1"}`
    resp := performRequest(app, "POST", "/adduser", requestBody)

    // Verifica se a resposta HTTP está correta
    assert.Equal(t, http.StatusOK, resp.StatusCode)

    // Lê o corpo da resposta
    var responseBody map[string]interface{}
    err := json.NewDecoder(resp.Body).Decode(&responseBody)
    if err != nil {
        t.Errorf("Erro ao analisar o corpo da resposta JSON: %v", err)
    }

    // Verifica se o usuário foi adicionado com sucesso à sala de bate-papo
    assert.Equal(t, "User added to chatroom", responseBody["message"])
    assert.Equal(t, "room1", responseBody["chatroom"].(map[string]interface{})["Name"])
    assert.Contains(t, responseBody["chatroom"].(map[string]interface{})["Users"], "user1")
}

func setupServer() *fiber.App {
    // Inicializa o servidor Fiber
    app := fiber.New()

    // Inicializa o mapa de salas de bate-papo
    chatrooms = make(map[string]*Chatroom)

    // Adiciona a rota para adicionar usuário a uma sala de bate-papo
    app.Post("/adduser", func(c *fiber.Ctx) error {
        // Implementação da rota está presente aqui, mas como este é um teste de unidade, não precisamos incluí-la novamente.
        fmt.Println("aqui")
        return nil
    })

    return app
}

// performRequest é uma função de utilidade para simular uma solicitação HTTP ao servidor Fiber.
func performRequest(app *fiber.App, method, path, body string) *http.Response {
    req, _ := http.NewRequest(method, path, bytes.NewBufferString(body))
    req.Header.Set("Content-Type", "application/json")
    resp, _ := app.Test(req, -1)
    return resp
}
