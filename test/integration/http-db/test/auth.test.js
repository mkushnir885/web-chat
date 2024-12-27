import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as queryString from "node:querystring";
import sendRequest from "./utils/send-request.js";
import { openDbConn, closeDbConn } from "./utils/db-connection.js";

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;

describe("User authentication", () => {
  beforeAll(() => {
    db = openDbConn();
  });
  afterAll(() => closeDbConn(db));

  it("should sign up because no such user", async () => {
    const userData = { nickname: "Bob", password: "12345" };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendRequest(`${ADDR}/signup`, options, body);
    const [createdUser] = await db
      .select("user")
      .where({ nickname: userData.nickname })
      .run();

    expect(statusCode).toBe(201);
    expect(createdUser).toBeDefined();
  });

  it("should not sign up because such user already exists", async () => {
    const userData = { nickname: "Bob", password: "12345" };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendRequest(`${ADDR}/signup`, options, body);

    expect(statusCode).toBe(400);
  });

  it("should log in because valid credentials", async () => {
    const userData = { nickname: "Bob", password: "12345" };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const body = queryString.stringify(userData);

    const { statusCode, headers } = await sendRequest(
      `${ADDR}/login`,
      options,
      body,
    );

    expect(statusCode).toBe(201);
    expect(headers["set-cookie"]).toBeDefined();
  });

  it("should not log in because user does not exist", async () => {
    const userData = { nickname: "John", password: "abcde" };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const body = queryString.stringify(userData);

    const { statusCode } = await sendRequest(`${ADDR}/login`, options, body);

    expect(statusCode).toBe(401);
  });

  it("should handle cookies", async () => {
    let cookies;
    // Log in to get cookies
    {
      const userData = { nickname: "Bob", password: "12345" };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      };
      const body = queryString.stringify(userData);

      const { headers } = await sendRequest(`${ADDR}/login`, options, body);
      cookies = headers["set-cookie"];
    }

    const options = { method: "GET", headers: { Cookie: cookies } };

    const { statusCode } = await sendRequest(`${ADDR}/chat/server`, options);

    expect(statusCode).toBe(200);
  });

  it("should log out", async () => {
    let cookies;
    // Log in to get cookies
    {
      const userData = { nickname: "Bob", password: "12345" };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      };
      const body = queryString.stringify(userData);

      const { headers } = await sendRequest(`${ADDR}/login`, options, body);
      cookies = headers["set-cookie"];
    }

    // Log out
    {
      const options = { method: "DELETE", headers: { Cookie: cookies } };

      const { statusCode } = await sendRequest(`${ADDR}/logout`, options);

      expect(statusCode).toBe(200);
    }

    // Check if /chat is inaccessible
    {
      const options = { method: "GET", headers: { Cookie: cookies } };

      const { statusCode } = await sendRequest(`${ADDR}/chat/server`, options);

      expect(statusCode).toBe(403);
    }
  });
});
