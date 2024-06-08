import HttpError from '../http-error.js';
import User from '../models/user.js';
import Session from '../session.js';

const handleCredentials = async (nickname, password) => {
  const user = await User.getByNickname(nickname);
  const hash = User.hashPassword(password);
  if (!user || user.password !== hash) {
    throw new HttpError(401, 'Invalid credentials');
  }
  return user;
};

export async function createUser(client) {
  try {
    const { nick, pass } = client.req.body;
    const userData = { nickname: nick, password: pass };
    const createdUserId = await User.create(userData);
    const createdUser = await User.getById(createdUserId);
    client.update('user', createdUser);
    Session.start(client);
    client.session.set('userId', createdUserId);
    client.session.save();
    client.sendCookie();
    client.updateRes('statusCode', 201);
    client.res.end(JSON.stringify({ message: 'Account created successfully.' }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes('statusCode', statusCode || 400);
    client.res.end(JSON.stringify({ errorMessage: `Cannot create account (${message}).` }));
  }
}

export async function updateUserProfile(client) {
  try {
    const { id } = client.user;
    const { nick, pass } = client.req.body;
    const userData = {};
    if (nick) userData.nickname = nick;
    if (pass) userData.password = pass;
    await User.updateById(id, userData);
    const updatedUser = await User.getById(id);
    client.update('user', updatedUser);
    client.updateRes('statusCode', 202);
    client.res.end(JSON.stringify({ message: 'Account updated successfully.' }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes('statusCode', statusCode || 400);
    client.res.end(JSON.stringify({ errorMessage: `Cannot update account (${message}).` }));
  }
}

export async function loginUser(client) {
  try {
    const { nick, pass } = client.req.body;
    const user = await handleCredentials(nick, pass);
    client.update('user', user);
    Session.start(client);
    client.session.set('userId', user.id);
    client.session.save();
    client.sendCookie();
    client.updateRes('statusCode', 201);
    client.res.end(JSON.stringify({ message: 'Now you are logged in.' }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes('statusCode', statusCode || 400);
    client.res.end(JSON.stringify({ errorMessage: `Cannot log in (${message}).` }));
  }
}

export async function logoutUser(client) {
  try {
    Session.delete(client);
    client.update('user', null);
    client.sendCookie();
    client.updateRes('statusCode', 200);
    client.res.end(JSON.stringify({ message: 'Now you are logged out.' }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes('statusCode', statusCode || 400);
    client.res.end(JSON.stringify({ errorMessage: `Cannot log out (${message}).` }));
  }
}

export async function deleteUser(client) {
  try {
    const { id } = client.user;
    await User.deleteById(id);
    Session.delete(client);
    client.update('user', null);
    client.sendCookie();
    client.updateRes('statusCode', 200);
    client.res.end(JSON.stringify({ message: 'Account deleted successfully.' }));
  } catch (err) {
    const { statusCode, message } = err;
    client.updateRes('statusCode', statusCode || 400);
    client.res.end(JSON.stringify({ errorMessage: `Cannot delete account (${message}).` }));
  }
}
