'use strict';

// Testing bounce email contents related to errors occuring during SMTP dialog

// About running the tests:
// - Making a folder for queuing files
// - Creating a HMailItem instance using fixtures/util_hmailitem
// - Talk some SMTP in the playbook
// - Test the outcome by replacing trigger functions with our testing code (outbound.send_email, HMailItem.temp_fail, ...)
//   At one point, the mocked remote SMTP says "5XX" or "4XX" and we test that
//   * outbound.send_email is called with a RFC3464 bounce message
//   * or, in case of 4XX: that temp_fail is called and dsn vars are available)

const assert = require('node:assert')
const fs          = require('node:fs');
const path        = require('node:path');

const util_hmailitem = require('./fixtures/util_hmailitem');
const TODOItem    = require('../outbound/todo');
const HMailItem   = require('../outbound/hmail');
const obc         = require('../outbound/config');
const outbound    = require('../outbound');
const mock_sock   = require('./fixtures/line_socket');

obc.cfg.pool_concurrency_max = 0;

const outbound_context = {
    TODOItem,
    exports: outbound
}

const queue_dir = path.resolve(__dirname, 'test-queue');

