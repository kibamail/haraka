const constants = require("haraka-constants");

exports.register = function () {
    this.register_hook("queue_outbound", "hook_queue_outbound");
    this.register_hook("send_email", "hook_send_email");
    this.register_hook("send_email_delayed", "hook_send_email_delayed");
    this.register_hook("delivered", "hook_delivered");
    this.register_hook("bounce", "hook_bounce");
    this.register_hook("deferred", "hook_deferred");
};

exports.hook_queue_outbound = function (next, connection, params) {
    // Define custom MX settings
    const outbound = require("./outbound");

    // outbound.serialise_todo((todo) => {
    //     connection.loginfo(this, {todo})
    //     next()
    // })

    next(constants.delay);
};

exports.hook_send_email = function (next, connection, params) {
    next(constants.cont);
};

exports.hook_send_email_delayed = function (next, connection, params) {
    next(constants.ok);
};

exports.hook_delivered = function (next, connection, params) {
    next(constants.cont);
};

exports.hook_deferred = function (next, connection, params) {
    next(constants.deny);
};

exports.hook_bounce = function (next, connection, params) {
    next();
};
