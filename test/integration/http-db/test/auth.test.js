import "dotenv/config";

import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as queryString from "node:querystring";
import initDb from "../../../../lib/database/database.js";
import sendRequest from "./utils/send-request.js";
import Logger from "../../../../lib/logger/logger.js";

const { env } = process;

const ADDR = `http://${env.HTTP_HOST}:${env.HTTP_PORT}`;

let db;

const openDbConn = () => {
  const logger = new Logger({ useConsole: true });
  db = initDb(
    {
      host: env.DB_HOST,
      user: env.DB_USER,
      database: env.DB_NAME,
      password: env.DB_PASS,
    },
    logger,
  );
};

const closeDbConn = async () => {
  await db.close();
};

describe("User authentication", () => {
  beforeAll(() => openDbConn());
  afterAll(() => closeDbConn());

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

    const { statusCode } = await sendRequest(`${ADDR}/chat`, options);

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

      const { statusCode } = await sendRequest(`${ADDR}/chat`, options);

      expect(statusCode).toBe(404);
    }
  });
});
