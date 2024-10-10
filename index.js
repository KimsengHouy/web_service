const http = require("http")
const socket = require("websocket").server
const server = http.createServer(() => {})

server.listen(443, () => {
    console.log('WebSocket server is listening on port 443')
})

const webSocket = new socket({httpServer: server})

webSocket.on('request', (req) => {
    const connection = req.accept()

    connection.on('message', (message) => {
        try {
            // Log the received data, assumed to be the 'extras' sent from Android
            const data = JSON.parse(message.utf8Data)
            console.log("Received extras from Android: ", data)  // Log the extras here
        } catch (e) {
            console.log("Error processing message: ", e.message)
        }
    })

    connection.on('close', () => {
        console.log('Connection closed')
    })

    connection.on('error', (err) => {
        console.log('Connection error: ', err)
    })
})
