package main

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type Message struct {
	Sender    string `json:"sender"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

var (
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan Message)
	upgrader  = websocket.Upgrader{}
)

func handleWebSocketConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade da conexão HTTP para WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// Adiciona a nova conexão ao mapa de clientes
	clients[ws] = true

	// Loop para ouvir mensagens do cliente
	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Erro ao ler a mensagem: %v", err)
			delete(clients, ws)
			break
		}
		// Envia a mensagem recebida para o canal de broadcast
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Recebe a próxima mensagem do canal de broadcast
		msg := <-broadcast
		// Envia a mensagem para todos os clientes conectados
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Erro ao enviar mensagem para o cliente: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {
	// Configuração das rotas
	http.HandleFunc("/ws", handleWebSocketConnections)
	// Inicia o servidor WebSocket
	go handleMessages()
	// Inicia o servidor HTTP na porta 8080
	log.Println("Servidor escutando na porta 8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Erro ao iniciar o servidor: ", err)
	}

}
