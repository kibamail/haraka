"use strict";

// Testing bounce email contents related to errors occuring during SMTP dialog

// About running the tests:
// - Making a folder for queuing files
// - Creating a HMailItem instance using fixtures/util_hmailitem
// - Talk some STMP in the playbook
// - Test the outcome by replacing trigger functions with our testing code (outbound.send_email, HMailItem.temp_fail, ...)

const assert = require("node:assert");
const dns = require("node:dns");
const fs = require("node:fs");
const path = require("node:path");

const constants = require("haraka-constants");
const util_hmailitem = require("./fixtures/util_hmailitem");
const TODOItem = require("../outbound/todo");
const HMailItem = require("../outbound/hmail");
const outbound = require("../outbound");

const outbound_context = {
    TODOItem,
    exports: outbound,
};
