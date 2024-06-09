const CHAT_SERVER = 'ws://localhost:8090';

export default async function sendWssUrl(client) {
  const { res, user } = client;
  const query = `id=${user.id}&name=${user.nickname}`;
  res.end(`${CHAT_SERVER}?${query}`);
}
