// package handle

// import (
//     "log"
//     "net/http"
	
// 	"github.com/gofiber/websocket/v2"
// )

// // Definindo a estrutura para uma mensagem WebSocket
// type Message struct {
//     Sender  string `json:"sender"`
//     Content string `json:"content"`
// }

// var clients = make(map[*websocket.Conn]bool) // mapa para armazenar conexões de clientes
// var broadcast = make(chan Message)           // canal para enviar mensagens de um cliente para todos os outros

//  // Upgrader para atualizar uma conexão HTTP para uma conexão WebSocket

// func main() {
//     // Configurando uma rota para lidar com conexões WebSocket
//     http.HandleFunc("/ws", handleWebSocket)

//     // Iniciar um goroutine para lidar com mensagens de broadcast
//     go handleMessages()

//     // Iniciando o servidor na porta 8080
//     log.Println("Servidor WebSocket iniciado na porta 8080")
//     err := http.ListenAndServe(":8080", nil)
//     if err != nil {
//         log.Fatal("Erro ao iniciar o servidor:", err)
//     }
// }

// func handleWebSocket(w http.ResponseWriter, r *http.Request) {
//     // Atualiza a conexão HTTP para uma conexão WebSocket
//     conn, err := upgrader.Upgrade(w, r, nil)
//     if err != nil {
//         log.Println("Erro ao atualizar a conexão:", err)
//         return
//     }
//     defer conn.Close()

//     // Adiciona a nova conexão ao mapa de clientes
//     clients[conn] = true

//     // Loop para ler as mensagens do cliente
//     for {
//         var msg Message
//         // Ler a mensagem JSON do cliente
//         err := conn.ReadJSON(&msg)
//         if err != nil {
//             log.Println("Erro ao ler mensagem:", err)
//             delete(clients, conn) // Remove o cliente do mapa de clientes
//             break
//         }
//         // Enviar a mensagem para o canal de broadcast
//         broadcast <- msg
//     }
// }

// func handleMessages() {
//     for {
//         // Obter a próxima mensagem do canal de broadcast
//         msg := <-broadcast
//         // Enviar a mensagem para todos os clientes conectados
//         for client := range clients {
//             err := client.WriteJSON(msg)
//             if err != nil {
//                 log.Println("Erro ao enviar mensagem ao cliente:", err)
//                 client.Close() // Fechar a conexão se houver um erro de escrita
//                 delete(clients, client) // Remover o cliente do mapa de clientes
//             }
//         }
//     }
// }
