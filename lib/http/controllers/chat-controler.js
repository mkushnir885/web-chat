import authorize from "./authorize.js";

const HOST = process.env.WS_HOST || "localhost";
const PORT = process.env.WS_PORT || 8001;

export async function sendWssUrl(client) {
  try {
    authorize(client);
    const { res, user } = client;
    const query = `id=${user.id}&name=${user.nickname}`;
    res.end(`ws://${HOST}:${PORT}?${query}`);
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({
        errMessage: `Cannot connect to chat server (${message}).`,
      }),
    );
  }
}

export async function createChat(client, models) {
  try {
    authorize(client);
    const { chatName } = client.req.query;
    const createdChat = await models.chat.create(chatName, client.user.id);
    client.updateRes("statusCode", 201);
    client.res.end(
      JSON.stringify({
        message: "Chat created successfully.",
        chatId: createdChat,
      }),
    );
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errMessage: `Cannot create chat (${message}).` }),
    );
  }
}

export async function renameChat(client, models) {
  try {
    authorize(client);
    const { chatId, newChatName } = client.req.query;
    await models.chat.renameById(chatId, newChatName);
    client.updateRes("statusCode", 201);
    client.res.end(JSON.stringify({ message: "Chat renamed successfully." }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errMessage: `Cannot rename chat (${message}).` }),
    );
  }
}

export async function searchChat(client, models) {
  try {
    authorize(client);
    const { chatName } = client.req.query;
    const chat = await models.chat.getByName(chatName);
    client.updateRes("statusCode", 200);
    client.res.end(
      JSON.stringify({ message: "Chat found successfully.", chatId: chat.id }),
    );
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errMessage: `Cannot find chat (${message}).` }),
    );
  }
}

export async function joinChat(client, models) {
  try {
    authorize(client);
    const { chatId } = client.req.query;
    await models.chat.joinById(chatId, client.user.id);
    client.updateRes("statusCode", 200);
    client.res.end(JSON.stringify({ message: "Joined chat successfully." }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errMessage: `Cannot join chat (${message}).` }),
    );
  }
}

export async function exitChat(client, models) {
  try {
    authorize(client);
    const { chatId } = client.req.query;
    await models.chat.exitById(chatId, client.user.id);
    client.updateRes("statusCode", 200);
    client.res.end(JSON.stringify({ message: "Exited chat successfully." }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errMessage: `Cannot exit chat (${message}).` }),
    );
  }
}
