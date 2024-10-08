"use strict";
// Proxy to an SMTP server
// Opens the connection to the ongoing SMTP server at MAIL FROM time
// and passes back any errors seen on the ongoing server to the
// originating server.

const smtp_client_mod = require("./smtp_client");

exports.register = function () {
    this.load_smtp_proxy_ini();

    if (this.cfg.main.enable_outbound) {
        this.register_hook("queue_outbound", "hook_queue");
    }
};

exports.load_smtp_proxy_ini = function () {
    this.cfg = this.config.get(
        "smtp_proxy.ini",
        {
            booleans: ["-main.enable_tls", "+main.enable_outbound"],
        },
        () => {
            this.load_smtp_proxy_ini();
        },
    );

    if (this.cfg.main.enable_outbound) {
        this.lognotice(
            "outbound enabled, will default to disabled in Haraka v3 (see #1472)",
        );
    }
};

exports.hook_mail = function (next, connection, params) {
    const c = this.cfg.main;
    connection.loginfo(
        this,
        `forwarding to ${
            c.forwarding_host_pool
                ? "configured forwarding_host_pool"
                : `${c.host}:${c.port}`
        }`,
    );
    smtp_client_mod.get_client_plugin(
        this,
        connection,
        c,
        (err, smtp_client) => {
            connection.notes.smtp_client = smtp_client;
            smtp_client.next = next;

            smtp_client.on("mail", smtp_client.call_next);
            smtp_client.on("rcpt", smtp_client.call_next);
            smtp_client.on("data", smtp_client.call_next);

            smtp_client.on("dot", () => {
                if (smtp_client.is_dead_sender(this, connection)) {
                    delete connection.notes.smtp_client;
                    return;
                }

                smtp_client.call_next(OK, smtp_client.response);
                smtp_client.release();
                delete connection.notes.smtp_client;
            });

            smtp_client.on("error", () => {
                delete connection.notes.smtp_client;
            });

            smtp_client.on("bad_code", (code, msg) => {
                smtp_client.call_next(
                    code.match(/^4/) ? DENYSOFT : DENY,
                    smtp_client.response.slice(),
                );

                if (smtp_client.command !== "rcpt") {
                    // errors are OK for rcpt, but nothing else
                    // this can also happen if the destination server
                    // times out, but that is okay.
                    connection.loginfo(this, "message denied, proxying failed");
                    smtp_client.release();
                    delete connection.notes.smtp_client;
                }
            });
        },
    );
};

exports.hook_rcpt_ok = (next, connection, recipient) => {
    const { smtp_client } = connection.notes;
    if (!smtp_client) return next();
    if (smtp_client.is_dead_sender(this, connection)) {
        delete connection.notes.smtp_client;
        return;
    }
    smtp_client.next = next;
    smtp_client.send_command(
        "RCPT",
        `TO:${recipient.format(!smtp_client.smtp_utf8)}`,
    );
};

exports.hook_data = (next, connection) => {
    const { smtp_client } = connection.notes;
    if (!smtp_client) return next();

    if (smtp_client.is_dead_sender(this, connection)) {
        delete connection.notes.smtp_client;
        return;
    }
    smtp_client.next = next;
    smtp_client.send_command("DATA");
};

exports.hook_queue = function (next, connection) {
    if (!connection?.transaction || !connection?.notes) return next();

    const { smtp_client } = connection.notes;
    if (!smtp_client) return next();

    if (smtp_client.is_dead_sender(this, connection)) {
        delete connection.notes.smtp_client;
        return;
    }
    smtp_client.next = next;
    smtp_client.start_data(connection.transaction.message_stream);
};

exports.hook_rset = (next, connection) => {
    const { smtp_client } = connection.notes;
    if (!smtp_client) return next();
    smtp_client.release();
    delete connection.notes.smtp_client;
    next();
};

exports.hook_quit = exports.hook_rset;

exports.hook_disconnect = (next, connection) => {
    const { smtp_client } = connection.notes;
    if (!smtp_client) return next();
    smtp_client.release();
    delete connection.notes.smtp_client;
    smtp_client.call_next();
    next();
};
