process.env.DATABASE_URL =
  "postgresql://postgres:w@289461@localhost:5432/shopping-list";

//Path: server\controllers\usersController.test.js
const usersController = require("./usersController");
const db = require("../db");
const { getMockReq, getMockRes } = require("@jest-mock/express");
const { createHash, saltUser } = require("./users_util");
const request = require("supertest");
const { res, next } = getMockRes();
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mockUser = {
  name: "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL",
  password: createHash(
    "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TEST",
    saltUser("THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL")
  ),
  token: "'THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TEST'",
  expireTime: 999999999999,
};

describe("usersController", () => {
  beforeAll(async () => {
    await db.createUser(
      mockUser.name,
      mockUser.password,
      mockUser.token,
      mockUser.expireTime
    );
  });
  afterAll(async () => {
    await db.deleteUser(mockUser.name, mockUser.token);
  });

  describe("routes", () => {
    it("should have all routes", () => {
      const routes = [
        { path: "/sanity", method: "get" },
        { path: "/new", method: "post" },
        { path: "/login", method: "post" },
        { path: "/logout", method: "post" },
        { path: "/test-token", method: "get" },
      ];

      // optimize the below iterator

      routes.forEach((route) => {
        expect(
          usersController.stack.find(
            (s) =>
              s.route.path.includes(route.path) && s.route.methods[route.method]
          )
        ).toBeTruthy();
      });
    });
  });

  describe("sanity", () => {
    it("should return a sanity message", async () => {
      request(app)
        .get("/users/sanity")
        .expect("Content-Type", /json/)
        .expect("Content-Length", "20")
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
        });
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const req = getMockReq({
        body: mockUser,
      });

      await usersController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: expect.any(String),
        expireTime: expect.any(Number),
      });
    });

    it("should not login a user", async () => {
      const req = getMockReq({
        body: mockUser,
      });

      await usersController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid username or password",
      });
    });
  });

  describe("logout", () => {
    it("should logout a user", async () => {
      const req = getMockReq({
        body: mockUser,
      });

      await usersController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "You have been logged out.",
      });
    });

    it("should not logout a user", async () => {
      const req = getMockReq({
        body: mockUser,
      });

      await usersController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired user token",
      });
    });
  });

  describe("testToken", () => {
    it("should test a user token", async () => {
      const req = getMockReq({
        headers: mockUser,
      });

      await usersController.testToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Valid user token",
      });
    });

    it("should not test a user token", async () => {
      const req = getMockReq({
        headers: mockUser,
      });

      await usersController.testToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired user token",
      });
    });
  });
});
