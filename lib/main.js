import http from 'node:http';
import router from './router.js';

const PORT = 8080;

router.staticDir = 'public';
router.get('/', async (req, res) => {
  await router.static('/index.html', res);
});

const server = http.createServer(async (req, res) => {
  await router.handler(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
