/**
 * ws-tcp-proxy.js
 * WebSocket → TCP proxy (websockify alternatifi)
 * Ruffle'ın Flash socket bağlantısı için kullanılır.
 * 
 * Kullanım: node ws-tcp-proxy.js
 * Gereksinim: npm install ws
 */

const net = require('net');
const { WebSocketServer } = require('ws');

const WS_PORT = 8100;          // Ruffle opens this port
const TCP_HOST = '127.0.0.1';
const TCP_PORT = 9500;          // Game server TCP port

const wss = new WebSocketServer({ port: WS_PORT });

console.log(`[WS-TCP Proxy] WebSocket :${WS_PORT} → TCP ${TCP_HOST}:${TCP_PORT}`);

wss.on('connection', function (ws, req) {
    const clientIp = req.socket.remoteAddress;
    console.log(`[+] New Connection: ${clientIp}`);

    const tcp = new net.Socket();
    tcp.connect(TCP_PORT, TCP_HOST, function () {
        console.log(`[+] TCP ${TCP_HOST}:${TCP_PORT} connected`);
    });

    ws.on('message', function (data) {
        if (tcp.writable) {
            tcp.write(Buffer.isBuffer(data) ? data : Buffer.from(data));
        }
    });

    tcp.on('data', function (data) {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    });

    ws.on('close', function () {
        console.log(`[-] WebSocket closed: ${clientIp}`);
        tcp.destroy();
    });

    tcp.on('close', function () {
        console.log(`[-] TCP connection closed`);
        if (ws.readyState === ws.OPEN) ws.close();
    });

    ws.on('error', function (err) {
        console.error(`[!] WebSocket error: ${err.message}`);
        tcp.destroy();
    });

    tcp.on('error', function (err) {
        console.error(`[!] TCP error: ${err.message}`);
        if (ws.readyState === ws.OPEN) ws.close();
    });
});

wss.on('error', function (err) {
    console.error(`[!] Server error: ${err.message}`);
});
