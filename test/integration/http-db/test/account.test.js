import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import * as queryString from "node:querystring";
import sendRequest from "./utils/send-request.js";
import { openDbConn, closeDbConn } from "./utils/db-connection.js";

const ADDR = `http://${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`;

let db;
let cookie;

describe("User account management", () => {
  beforeAll(async () => {
    db = openDbConn();

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    };
    const body = queryString.stringify({ nickname: "Bob", password: "12345" });
    const { headers } = await sendRequest(`${ADDR}/signup`, options, body);
    cookie = headers["set-cookie"];
  });

  afterAll(() => closeDbConn(db));

  it("should be able to rename user", async () => {
    const nickname = "John";
    const options = {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const body = queryString.stringify({ nickname });

    const { statusCode } = await sendRequest(
      `${ADDR}/account/update`,
      options,
      body,
    );
    expect(statusCode).toBe(202);

    const [updatedUser] = await db.select("user").where({ nickname }).run();
    expect(updatedUser).toBeDefined();

    const [oldUser] = await db.select("user").where({ nickname: "Bob" }).run();
    expect(oldUser).toBeUndefined();
  });

  it("should be able to delete user", async () => {
    const options = {
      method: "DELETE",
      headers: { Cookie: cookie },
    };

    const { statusCode } = await sendRequest(`${ADDR}/account`, options);
    expect(statusCode).toBe(200);

    const [user] = await db.select("user").where({ nickname: "John" }).run();
    expect(user).toBeUndefined();
  });
});
