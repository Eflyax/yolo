import {serve} from 'bun';

const PORT = Number(process.env.PORT ?? 3000);

serve({
	port: PORT,
	fetch(req, server) {
		if (server.upgrade(req)) {
			return;
		}

		return new Response('Git Yak server', {status: 200});
	},
	websocket: {
		open(ws) {
			console.log('[ws] client connected');
			ws.send(JSON.stringify({type: 'hello', message: 'Git Yak server ready'}));
		},
		async message(ws, message) {
			// command routing will be added in later phases
			console.log('[ws] message received:', message);
		},
		close(ws) {
			console.log('[ws] client disconnected');
		},
	},
});

console.log(`[server] running on port ${PORT}`);
