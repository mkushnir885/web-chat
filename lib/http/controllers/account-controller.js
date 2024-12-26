import HttpError from "../http-error.js";
import Session from "../auth/session/session.js";
import { hashPassword } from "../../models/user.js";

const handleCredentials = async (userModel, nickname, password) => {
  const user = await userModel.getByNickname(nickname);
  const hash = hashPassword(password);
  if (!user || user.password !== hash) {
    throw new HttpError(401, "Invalid credentials");
  }
  return user;
};

export async function createUser(client, models) {
  try {
    const { nickname, password } = client.req.body;
    const createdUserId = await models.user.create({ nickname, password });
    const createdUser = await models.user.getById(createdUserId);
    client.update("user", createdUser);
    Session.start(client);
    client.session.set("userId", createdUserId);
    await client.session.save(models);
    client.sendCookie();
    client.updateRes("statusCode", 201);
    client.res.end(
      JSON.stringify({ message: "Account created successfully." }),
    );
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errorMessage: `Cannot create account (${message}).` }),
    );
  }
}

export async function updateUserProfile(client, models) {
  try {
    const { id } = client.user;
    const { nickname, password } = client.req.body;
    await models.user.updateById(id, { nickname, password });
    const updatedUser = await models.user.getById(id);
    client.update("user", updatedUser);
    client.updateRes("statusCode", 202);
    client.res.end(
      JSON.stringify({ message: "Account updated successfully." }),
    );
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errorMessage: `Cannot update account (${message}).` }),
    );
  }
}

export async function loginUser(client, models) {
  try {
    const { nickname, password } = client.req.body;
    const user = await handleCredentials(models.user, nickname, password);
    client.update("user", user);
    Session.start(client);
    client.session.set("userId", user.id);
    await client.session.save(models);
    client.sendCookie();
    client.updateRes("statusCode", 201);
    client.res.end(JSON.stringify({ message: "Now you are logged in." }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errorMessage: `Cannot log in (${message}).` }),
    );
  }
}

export async function logoutUser(client, models) {
  try {
    await Session.delete(client, models);
    client.update("user", null);
    client.sendCookie();
    client.updateRes("statusCode", 200);
    client.res.end(JSON.stringify({ message: "Now you are logged out." }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errorMessage: `Cannot log out (${message}).` }),
    );
  }
}

export async function deleteUser(client, models) {
  try {
    const { id } = client.user;
    await models.user.deleteById(id);
    await Session.delete(client, models);
    client.update("user", null);
    client.sendCookie();
    client.updateRes("statusCode", 200);
    client.res.end(
      JSON.stringify({ message: "Account deleted successfully." }),
    );
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes("statusCode", statusCode || 400);
    client.res.end(
      JSON.stringify({ errorMessage: `Cannot delete account (${message}).` }),
    );
  }
}
