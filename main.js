// Bootstrapping esm support
require = require("esm")(module);
module.exports = require("./main.esm.js");
