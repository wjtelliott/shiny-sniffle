// Testing user controller
const usersController = require("../usersController");
const app = require("../../serverTestEnv");
app.use("/", usersController);

// DB connection & util
const db = require("../../db");
const { createHash, saltUser, log } = require("../users_util");

// Testing
const request = require("supertest");
//const { res, next } = getMockRes();
//const { getMockReq, getMockRes } = require("@jest-mock/express");

const mockUser = {
  name: "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL",
  password: "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL",
  passwordHash: createHash(
    "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL",
    saltUser("THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL")
  ),
  token: "THIS-IS-A-FAKE-ACCOUNT-REMOVE-IF-TESTS-FAIL",
  expireTime: 999999999999999,
};

describe("usersController", () => {
  // Write new user straight to db
  beforeAll(async () => {
    await db.createUser(
      mockUser.name,
      mockUser.passwordHash,
      mockUser.token,
      mockUser.expireTime
    );
  });
  afterAll(async () => {
    // Check if the mock user still exists in the db
    const userExists = await db.userExists(mockUser.name);
    if (!userExists) {
      db.closeConnection();
      return;
    }

    // Log in the mock user to get token and delete from db
    const response = await request(app)
      .post("/login")
      .send({ name: mockUser.name, password: mockUser.password });
    const testUserToken = response._body["token"];
    await db.deleteUser(mockUser.name, testUserToken);
    await db.closeConnection();
  });

  describe("sanity", () => {
    it("1=1", () => {
      expect(1).toBe(1);
    });
  });

  describe("routes", () => {
    it("should have all routes", () => {
      const routes = [
        { path: "/sanity", method: "get" },
        { path: "/new", method: "post" },
        { path: "/login", method: "post" },
        { path: "/logout", method: "post" },
        { path: "/test-token", method: "get" },
        { path: "/delete", method: "delete" },
      ];

      routes.forEach((route) => {
        expect(
          usersController.stack.some(
            (s) =>
              s.route.path.includes(route.path) && s.route.methods[route.method]
          )
        ).toBeTruthy();
      });
    });
  });

  describe("sanity route", () => {
    it("tests should return a sanity message", async () => {
      const response = await request(app).get("/sanity");

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["message"]).toBeTruthy();
    });
  });

  describe("login route", () => {
    it("tests should login a user", async () => {
      const response = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["token"]).toBeTruthy();
      expect(response._body["expireTime"]).toBeTruthy();
    });

    it("tests should not login a user", async () => {
      const response = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: "wrong-password" });

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });
  });

  describe("logout route", () => {
    it("tests should logout a user that is logged in", async () => {
      // log the user in to get a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse._body["token"];

      // log the user out
      const logoutResponse = await request(app)
        .post("/logout")
        .send({ name: mockUser.name, token: `${testUserToken}` });

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.header["content-type"]).toMatch(/json/);
      expect(logoutResponse._body["message"]).toBeTruthy();
    });

    it("tests should 404 on logout with invalid token", async () => {
      // Logout response should 404 if token is wrong
      const response = await request(app)
        .post("/logout")
        .send({ name: mockUser.name, token: "wrong-token" });

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });

    it("tests should 404 on logging out with an expired token", async () => {
      // login the user to generate a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse._body["token"];

      // set DB token to expired
      await db.updateUserToken(mockUser.name, testUserToken, 0);

      // Logout response should 404 if token is expired
      const response = await request(app)
        .post("/logout")
        .send({ name: mockUser.name, token: testUserToken });

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });
  });

  describe("test-token route", () => {
    it("tests should accept a valid non-expired user token", async () => {
      // log the user in to get a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse.body["token"];

      // test the token
      const response = await request(app)
        .get("/test-token")
        .set("Accept", "application/json")
        .set({ name: mockUser.name, token: testUserToken })
        .send();

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["message"]).toBeTruthy();
    });

    it("tests should 404 on wrongly provided token", async () => {
      // log in the user to generate a token
      await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });

      // test the wrong token
      const response = await request(app)
        .get("/test-token")
        .set("Accept", "application/json")
        .set({ name: mockUser.name, token: "wrong-token" })
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });

    it("tests should 404 on expired token", async () => {
      // log in the user to get a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse._body["token"];

      // set DB token to expired
      await db.updateUserToken(mockUser.name, testUserToken, 0);

      // test the expired token
      const response = await request(app)
        .get("/test-token")
        .set("Accept", "application/json")
        .set({ name: mockUser.name, token: testUserToken })
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });
  });

  describe("update-password route", () => {
    it("tests should update a user's password", async () => {
      // log in the user to get a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse._body["token"];

      // update the user's password, even if we supply the same password
      // the password should be updated with the correct response
      const response = await request(app)
        .put("/password")
        .set("Accept", "application/json")
        .send({
          password: mockUser.password,
          name: mockUser.name,
          token: testUserToken,
        });

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["message"]).toBeTruthy();

      // check db to make sure password was updated
      const user = await db.getAllData(mockUser.name);
      expect(user.user_hash).toBe(mockUser.passwordHash);
    });

    it("tests should 404 on updating password with invalid token", async () => {
      // update the user's password with an invalid token
      const response = await request(app)
        .put("/password")
        .set("Accept", "application/json")
        .send({
          password: mockUser.password,
          name: mockUser.name,
          token: "wrong-token",
        });

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });
  });

  describe("delete route", () => {
    it("tests should delete a user", async () => {
      //log in the user to get a token
      const loginResponse = await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });
      const testUserToken = loginResponse._body["token"];

      // delete the user
      const response = await request(app)
        .delete("/delete")
        .set("Accept", "application/json")
        .set({ name: mockUser.name, token: testUserToken })
        .send();

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["message"]).toBeTruthy();
    });

    it("tests should 404 on deleting a user with invalid token", async () => {
      // check if user exists in db, create if not
      const user = await db.getAllData(mockUser.name);
      if (!user)
        await db.createUser(mockUser.name, mockUser.passwordHash, "token", 0);

      // log in the user to get a token
      await request(app)
        .post("/login")
        .send({ name: mockUser.name, password: mockUser.password });

      // delete the user with an invalid token
      const response = await request(app)
        .delete("/delete")
        .set("Accept", "application/json")
        .set({ name: mockUser.name, token: "wrong-token" })
        .send();

      expect(response.status).toBe(404);
      expect(response.header["content-type"]).toMatch(/json/);
      expect(response._body["error"]).toBeTruthy();
    });
  });
});
