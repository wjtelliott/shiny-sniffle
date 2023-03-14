// Testing list controller
const usersController = require("../usersController");
const listController = require("../listController");
const app = require("../../serverTestEnv");
app.use("/user", usersController);
app.use("/", listController);

// DB connection & util
const db = require("../../db");
const { createHash, saltUser, log } = require("../users_util");

// Testing
const request = require("supertest");

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

beforeAll(async () => {
  // if user already exists, delete it
  if (await db.userExists(mockUser.name)) {
    await db.deleteUserAdmin(mockUser.name);
  }

  // create mock user to crud lists
  await db.createUser(
    mockUser.name,
    mockUser.passwordHash,
    mockUser.token,
    mockUser.expireTime
  );
});

afterAll(async () => {
  // delete all mock user lists
  await db.deleteAllLists(mockUser.name, mockUser.token);
  // delete mock user
  await db.deleteUser(mockUser.name, mockUser.token);
  await db.closeConnection();
});

describe("List Controller", () => {
  describe("All routes", () => {
    it("all routes should exist on controller", () => {
      expect(listController).toBeDefined();

      const routes = [
        { path: "/sanity", method: "get" },
        { path: "/new", method: "post" },
        { path: "/update", method: "put" },
        { path: "/delete", method: "delete" },
        { path: "/", method: "get" },
        { path: "/:listId", method: "get" },
      ];

      routes.forEach((route) => {
        const routeObj = listController.stack.find(
          (r) => r.route.path === route.path && r.route.methods[route.method]
        );
        expect(routeObj).toBeDefined();
      });
    });
  });

  describe("Sanity route", () => {
    it("tests should return 200 with message", async () => {
      const res = await request(app).get("/sanity");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.message).toBeTruthy();
    });
  });

  describe("Create list route", () => {
    it("should return 201 with message", async () => {
      const res = await request(app).post("/new").send({
        name: mockUser.name,
        token: mockUser.token,
        listItems: [],
        listOrder: [],
      });

      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.id).toBeTruthy();
      expect(res.body.message).toBeTruthy();
    });
  });

  describe("Update list route", () => {
    it("should return 200 with message", async () => {
      // create new list to update
      const createResponse = await request(app).post("/new").send({
        name: mockUser.name,
        token: mockUser.token,
        listItems: [],
        listOrder: [],
      });

      const { id } = createResponse.body;

      const res = await request(app)
        .put("/update")
        .send({
          name: mockUser.name,
          token: mockUser.token,
          listId: id,
          listItems: ["new item"],
          listOrder: [0, 1, 2],
        });
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.message).toBeTruthy();
    });
  });

  describe("Delete list route", () => {
    it("should return 200 with message", async () => {
      // make sure there are no lists for this mock user
      await db.deleteAllLists(mockUser.name, mockUser.token);

      // create new list to delete
      const createResponse = await request(app).post("/new").send({
        name: mockUser.name,
        token: mockUser.token,
        listItems: [],
        listOrder: [],
      });

      const { id } = createResponse.body;

      const res = await request(app).delete("/delete").send({
        name: mockUser.name,
        token: mockUser.token,
        listId: id,
      });

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.message).toBeTruthy();
    });
  });
});
