const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>filesapp</title></head>');
    res.write('<body>');
    const readStream = fs.createReadStream('mess.txt', 'utf8');
    readStream.on('error', (err) => {
      res.write('<p>No message yet</p>');
    });

    res.write(
      '<form action="/mess" method="POST"><input type="text" name="mess"><button type="submit">Send</button></form>'
    );
    readStream.pipe(res);
    if (fs.existsSync('mess.txt')) {
        const mess = fs.readFileSync('mess.txt', 'utf8');
        res.write(`<p>Message: ${mess}</p>`);
      } else {
        res.write('<p>No message yet</p>');
      }
      
    res.write('</body>');
    res.write('</html>');
    return res.end();
  } else if (url === '/mess' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const mess = parsedBody.split('=')[1];
      fs.writeFile('mess.txt', mess, (err) => {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
      });
    });
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<head><title>filespage</title></head>');
    res.write('<body>');
    if (fs.existsSync('mess.txt')) {
      const mess = fs.readFileSync('mess.txt', 'utf8');
      res.write(`<p>Message: ${mess}</p>`);
    } else {
      res.write('<p>No message yet</p>');
    }
    res.write(
      '<form action="/mess" method="POST"><input type="text" name="mess"><button type="submit">Send</button></form>'
    );
    res.write('</body>');
    res.write('</html>');
    return res.end();
  }
});

server.listen(1100);
