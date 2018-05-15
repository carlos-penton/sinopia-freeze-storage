#!/usr/bin/env node

// Cuz we're that fancy
require = require("esm")(module);
module.exports = require("./cli.esm.js");
