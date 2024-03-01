// Node.js HTTP server

const { createReadStream } = require('node:fs');
const { access, constants, stat } = require('node:fs/promises');
const { createServer } = require('node:http');
const { join } = require('node:path');

createServer(async (req, res) => {
  if (req.method.toUpperCase() === 'GET') {
    const staticFile = join(process.cwd(), req.url);
    if (await stat(staticFile).then((stats) => stats.isFile()).catch(() => false)) {
      createReadStream(staticFile).pipe(res);
      return;
    }
  }

  res.writeHead(404);
  res.end();
}).listen(3456, () => {
  console.log('Binary BMP Example Server Running at http://localhost:3456/docs/index.html');
});
