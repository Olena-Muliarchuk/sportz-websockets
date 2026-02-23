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

     server.on('upgrade', async (req, socket, head) => {
         const { pathname } = new URL(req.url, `http://${req.headers.host}`);

         if (pathname !== '/ws') {
             return;
         }

         if (wsArcjet) {
             try {
                 const decision = await wsArcjet.protect(req);

                 if (decision.isDenied()) {
                     if (decision.reason.isRateLimit()) {
                         socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
                     } else {
                         socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                     }
                     socket.destroy();
                     return;
                 }
             } catch (e) {
                 console.error('WS upgrade protection error', e);
                 socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                 socket.destroy();
                 return;
             }
         }

         wss.handleUpgrade(req, socket, head, (ws) => {
             wss.emit('connection', ws, req);
         });
     });

    wss.on('close', () => clearInterval(interval));

    wss.on('connection', async (socket) => {
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
