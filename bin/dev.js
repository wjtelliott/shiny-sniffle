// multiview CLI is not working on windows

var mv = require("multiview")();
mv.spawn("npm", ["run", "server"]);
mv.spawn("npm", ["run", "client"]);
