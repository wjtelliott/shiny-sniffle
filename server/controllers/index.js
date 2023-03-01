const fs = require("fs"),
  path = require("path"),
  baseFileName = path.basename(__filename),
  controllers = {};

// We don't want our util files to be controllers
const fileInBlacklist = (filename) => {
  const blacklist = ["util.js"];
  return blacklist.some((listItem) => filename.endsWith(listItem));
};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.endsWith(".js") &&
      !file.endsWith(".test.js") &&
      !fileInBlacklist(file) &&
      file !== baseFileName
    );
  })
  .forEach((controllerFile) => {
    const filePath = path.join(__dirname, controllerFile);
    const router = require(filePath);
    const controllerName = controllerFile.slice(0, controllerFile.length - 3);

    console.log(
      `[LOG] - Adding router '${controllerName}' from '${controllerFile}'`
    );

    controllers[controllerName] = router;
  });

module.exports = controllers;
