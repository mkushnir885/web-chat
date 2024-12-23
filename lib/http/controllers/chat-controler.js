const HOST = process.env.WS_HOST || "localhost";
const PORT = process.env.WS_PORT || 8001;

export default async function sendWssUrl(client) {
  const { res, user } = client;
  const query = `id=${user.id}&name=${user.nickname}`;
  res.end(`ws://${HOST}:${PORT}?${query}`);
}
