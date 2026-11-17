// Servidor HTTP de prueba en proceso APARTE (para que el padre pueda bloquearse sin matar la respuesta)
const http = require('http');
const port = Number(process.argv[2] || 0);
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<html><head><title>Cable de prueba</title></head><body><h1>Irán lanza misiles contra Israel</h1><time>2026-11-15</time></body></html>');
});
server.listen(port, '127.0.0.1', () => {
  console.log('READY ' + server.address().port);
});
process.on('SIGTERM', () => server.close(() => process.exit(0)));
