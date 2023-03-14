const jest = require("jest");
const path = require("path");

const options = {
  projects: [path.join(__dirname, "../server")],
  runInBand: true,
};

jest
  .runCLI(options, options.projects)
  .then((success) => {
    console.log(success);
  })
  .catch((failure) => {
    console.error(failure);
  });
