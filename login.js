const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Login Page</title></head>');
    res.write('<body>');
    res.write(
      '<form action="/login" method="POST"><label for="username">Enter your name:</label><input type="text" id="username" name="username"><button type="submit">Login</button></form>'
    );
    res.write('</body>');
    res.write('</html>');
    return res.end();
  } else if (url === '/login' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split('=')[1];
      console.log('username:', username);
      res.statusCode = 302;
      res.setHeader('Location', '/mess');
      res.setHeader('Set-Cookie', `username=${username}`);
      return res.end();
    });
  } else if (url === '/mess' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      const username = req.headers.cookie.split('=')[1];
      console.log('message:', message, 'username:', username);
      fs.appendFileSync('mess.txt', `${username}:${message}\n`);
      res.statusCode = 302;
      res.setHeader('Location', '/');
      return res.end();
    });
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>Message Page</title></head>');
    res.write('<body>');
    const username = req.headers.cookie ? req.headers.cookie.split('=')[1] : null;
    if (!username) {
      res.write(
        '<form action="/login" method="POST"><label for="username">Enter your name:</label><input type="text" id="username" name="username"><button type="submit">Login</button></form>'
      );
    } else {
      res.write(`<h2>Welcome, ${username}!</h2>`);
      res.write(
        `<form action="/mess" method="POST"><label for="message">Enter your message:</label><input type="text" id="message" name="message"><button type="submit">Send Message</button></form>`
      );
      if (fs.existsSync('mess.txt')) {
        const messages = fs.readFileSync('mess.txt', 'utf8');
        const messagesArray = messages.split('\n').filter((msg) => msg.length > 0);
        messagesArray.forEach((msg) => {
          const [msgUsername, message] = msg.split(':');
          res.write(`<p>${msgUsername}: ${message}</p>`);
        });
      } else {
        res.write('<p>No messages yet</p>');
      }
    }
    res.write('</body>');
    res.write('</html>');
    return res.end();
  }
});

server.listen(1300, () => {
  console.log('Server started on port 1300');
});
