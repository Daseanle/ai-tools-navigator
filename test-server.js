const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>连接测试</title></head>
      <body>
        <h1>🎉 连接成功！</h1>
        <p>如果你能看到这个页面，说明网络连接正常。</p>
        <p>现在可以访问主网站了！</p>
      </body>
    </html>
  `);
});

const PORT = 9000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`测试服务器运行在 http://127.0.0.1:${PORT}`);
});