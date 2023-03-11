require("jest");

const {
  saltUser,
  generateUserToken,
  createHash,
  checkUserPasswordMatch,
  sendErrorMessage,
} = require("../users_util");

describe("testing hashing", () => {
  it("tests correctly replicates a hash", () => {
    const nonHashed = "all.your.base.are.belong.to.us";
    const salt = "bobafett";
    const hash1 = createHash(nonHashed, salt),
      hash2 = createHash(nonHashed, salt);
    expect(hash1).toBe(hash2);
  });

  it("tests creates different hashes from similiar inputs", () => {
    const nonHashed = "code-go-here";
    const salt = "i-wish-i-knew-c++-better";
    const hash1 = createHash(nonHashed, salt),
      hash2 = createHash(nonHashed + ".", salt);
    expect(hash1 === hash2).toBe(false);
  });

  it("tests password matches correctly", () => {
    const name = "test-user";
    const password = "12345";
    const hashed = createHash(password, saltUser(name));
    expect(checkUserPasswordMatch(name, password, hashed)).toBe(true);
  });

  it("tests password fails to match incorrect attempt", () => {
    const name = "test-user";
    const password = "12345";
    const hashed = createHash(password, "no-salt-requierdedyooo");
    expect(checkUserPasswordMatch(name, password, hashed)).toBe(false);
  });
});

describe("testing user tokens", () => {
  it("tests should have random tokens /> 20 attempts", () => {
    // there is a slight chance this will fail due to randomness, but
    // it is highly unlikely
    const tokens = [...Array(20).keys()].map(generateUserToken);
    const dict = {};
    expect(
      tokens.some((token) => {
        if (dict[token]) return true;
        else dict[token] = 1;
      })
    ).toBe(false);
  });
});

describe("testing error message", () => {
  it("tests response function is called", () => {
    const res = {
      status(_) {
        const json = (msg) => {
          return msg;
        };
        return { json };
      },
    };
    const msg = "testing an error";
    const expected = { error: msg };
    expect(JSON.stringify(sendErrorMessage(res, msg, 200))).toBe(
      JSON.stringify(expected)
    );
  });
});
