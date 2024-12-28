import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as queryString from "node:querystring";
import sendRequest from "./utils/send-request.js";
import { openDbConn, closeDbConn } from "./utils/db-connection.js";

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;
let user1Cookie;
let user2Cookie;

describe("User chat rooms management", () => {
  beforeAll(async () => {
    db = openDbConn();

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };

    const req1Body = queryString.stringify({
      nickname: "Bob",
      password: "12345",
    });
    const { headers: res1Headers } = await sendRequest(
      `${ADDR}/signup`,
      options,
      req1Body,
    );
    user1Cookie = res1Headers["set-cookie"];

    const req2Body = queryString.stringify({
      nickname: "John",
      password: "abcde",
    });
    const { headers: res2Headers } = await sendRequest(
      `${ADDR}/signup`,
      options,
      req2Body,
    );
    user2Cookie = res2Headers["set-cookie"];
  });

  afterAll(() => closeDbConn(db));

  it("should create chat rooms for both users", async () => {
    const { statusCode: statusCode1 } = await sendRequest(
      `${ADDR}/chat/create?chatName=Chat1`,
      { method: "POST", headers: { Cookie: user1Cookie } },
    );
    expect(statusCode1).toBe(201);
    const [chat1] = await db.select("chat").where({ name: "Chat1" }).run();
    expect(chat1).toBeDefined();

    const { statusCode: statusCode2 } = await sendRequest(
      `${ADDR}/chat/create?chatName=Chat2`,
      { method: "POST", headers: { Cookie: user2Cookie } },
    );
    expect(statusCode2).toBe(201);
    const [chat2] = await db.select("chat").where({ name: "Chat2" }).run();
    expect(chat2).toBeDefined();
  });

  it("should be able to rename user chat room", async () => {
    const { statusCode } = await sendRequest(
      `${ADDR}/chat/rename?chatId=1&newChatName=ChatOne`,
      {
        method: "PATCH",
        headers: { Cookie: user1Cookie },
      },
    );

    expect(statusCode).toBe(201);

    const [updatedChat] = await db
      .select("chat")
      .where({ name: "ChatOne" })
      .run();
    expect(updatedChat).toBeDefined();

    const [oldChat] = await db.select("chat").where({ name: "Chat1" }).run();
    expect(oldChat).toBeUndefined();
  });

  let testChatId;

  it("should be able to find user chat room", async () => {
    const { statusCode, data } = await sendRequest(
      `${ADDR}/chat/search?chatName=Chat2`,
      {
        method: "GET",
        headers: { Cookie: user1Cookie },
      },
    );

    expect(statusCode).toBe(200);
    const { chatId } = JSON.parse(data);
    expect(chatId).toBeDefined();

    const [chat] = await db.select("chat").where({ id: chatId }).run();
    expect(chat.name).toBe("Chat2");

    testChatId = chatId;
  });

  it("should be able to join user chat room", async () => {
    const { statusCode } = await sendRequest(
      `${ADDR}/chat/join?chatId=${testChatId}`,
      {
        method: "POST",
        headers: { Cookie: user1Cookie },
      },
    );

    expect(statusCode).toBe(200);

    const chatsUsers = await db
      .select("chatUser")
      .where({ chatId: testChatId })
      .run();
    expect(chatsUsers.length).toBe(2);
  });

  it("should be able to exit user chat room", async () => {
    const { statusCode } = await sendRequest(
      `${ADDR}/chat/exit?chatId=${testChatId}`,
      {
        method: "DELETE",
        headers: { Cookie: user1Cookie },
      },
    );

    expect(statusCode).toBe(200);

    const chatsUsers = await db
      .select("chatUser")
      .where({ chatId: testChatId })
      .run();
    expect(chatsUsers.length).toBe(1);
  });
});
