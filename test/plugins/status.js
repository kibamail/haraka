'use strict';

const assert = require('node:assert')

const fixtures = require('haraka-test-fixtures');
const outbound = require('../../outbound');
const TimerQueue = require('../../outbound/timer_queue');

const Connection = fixtures.connection;

const _set_up = (done) => {
    this.plugin = new fixtures.plugin('status');
    this.plugin.outbound = outbound;

    this.connection = Connection.createConnection();
    this.connection.remote.is_local = true;
    done();
}

describe('status', () => {

    describe('register', () => {
        beforeEach(_set_up)

        it('loads the status plugin', () => {
            assert.equal('status', this.plugin.name);
        })
    })

    describe('access', () => {
        beforeEach(_set_up)

        it('remote', (done) => {
            this.connection.remote.is_local = false;
            this.plugin.hook_unrecognized_command((code) => {
                assert.equal(DENY, code);
                done();
            }, this.connection, ['STATUS', 'POOL LIST']);
        })
    })

    describe('pools', () => {
        beforeEach(_set_up)

        it('list_pools', (done) => {
            this.connection.respond = (code, message) => {
                const data = JSON.parse(message);
                assert.equal('object', typeof data); // there should be one pools array for noncluster and more for cluster
                done();
            };
            this.plugin.hook_unrecognized_command(() => {}, this.connection, ['STATUS', 'POOL LIST']);
        })
    })
})