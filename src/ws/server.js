import { WebSocketServer, WebSocket } from 'ws';

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }
    try {
        socket.send(JSON.stringify(payload));
    } catch (err) {
        console.error('Send error:', err);
    }
}

function broadcast(wss, payload) {
    const message = JSON.stringify(payload);
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
            continue;
        }
        try {
            client.send(message);
        } catch (err) {
            console.error('Broadcast individual client error:', err);
        }
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    });

    wss.on('connection', (socket) => {
        console.log('New WS connection established');
        sendJson(socket, { type: 'Welcome' });

        socket.on('error', (err) => console.error('Socket error:', err));

        socket.on('close', () => {
            console.log('Client disconnected');
        });
    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated };
}
