"use strict";

// queue file header data
class TODOItem {
    constructor(domain, recipients, transaction) {
        this.queue_time = Date.now();
        this.domain = domain;
        this.rcpt_to = recipients;
        this.mail_from = transaction.mail_from;
        this.message_stream = transaction.message_stream;
        this.notes = transaction.notes;
        this.uuid = transaction.uuid;
        this.force_tls = false;
    }

    serialise_message_stream() {
        return new Promise((resolve, reject) => {
            let message_content = "";
            this.message_stream.on("data", (chunk) => {
                message_content += chunk.toString();
            });
            this.message_stream.on("end", () => {
                resolve(message_content);
            });
            this.message_stream.on("error", (err) => {
                reject(err);
            });
        });
    }
}

module.exports = TODOItem;
