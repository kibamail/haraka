const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const Hmail = require("../../outbound/hmail");
const outbound = require("../../outbound/index");

describe("outbound/hmail", () => {
    beforeEach((done) => {
        this.hmail = new Hmail(
            "1508455115683_1508455115683_0_90253_9Q4o4V_1_haraka",
            "test/queue/1508455115683_1508455115683_0_90253_9Q4o4V_1_haraka",
            {},
        );
        done();
    });

    it("sort_mx", (done) => {
        const sorted = this.hmail.sort_mx([
            { exchange: "mx2.example.com", priority: 5 },
            { exchange: "mx1.example.com", priority: 6 },
        ]);
        assert.equal(sorted[0].exchange, "mx2.example.com");
        done();
    });
    it("sort_mx, shuffled", (done) => {
        const sorted = this.hmail.sort_mx([
            { exchange: "mx2.example.com", priority: 5 },
            { exchange: "mx1.example.com", priority: 6 },
            { exchange: "mx3.example.com", priority: 6 },
        ]);
        assert.equal(sorted[0].exchange, "mx2.example.com");
        assert.ok(
            sorted[1].exchange == "mx3.example.com" ||
                sorted[1].exchange == "mx1.example.com",
        );
        done();
    });
    it("force_tls", (done) => {
        this.hmail.todo = { domain: "miss.example.com" };
        this.hmail.obtls.cfg = {
            force_tls_hosts: ["1.2.3.4", "hit.example.com"],
        };
        assert.equal(this.hmail.get_force_tls({ exchange: "1.2.3.4" }), true);
        assert.equal(this.hmail.get_force_tls({ exchange: "1.2.3.5" }), false);
        this.hmail.todo = { domain: "hit.example.com" };
        assert.equal(this.hmail.get_force_tls({ exchange: "1.2.3.5" }), true);
        done();
    });
});
