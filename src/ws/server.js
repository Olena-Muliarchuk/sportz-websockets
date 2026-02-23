import { WebSocketServer, WebSocket } from 'ws';
import { wsArcjet } from '../arcjet.js';

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

    const interval = setInterval(() => {
        for (const client of wss.clients) {
            if (!client.isAlive) {
                client.terminate();
                continue;
            }
            client.isAlive = false;
            client.ping();
        }
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    wss.on('connection', async (socket, req) => {
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit()
                        ? 'Rate limit exceded'
                        : 'Accses denied';
                    socket.close(code, reason);
                    return;
                }
            } catch (error) {
                console.error('Ws connection error', error);
                socket.close(1011, 'Sever security error');
                return;
            }
        }

        socket.isAlive = true;
        socket.on('pong', () => {
            socket.isAlive = true;
        });

        sendJson(socket, { type: 'welcome' });

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
