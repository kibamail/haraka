exports.register = function () {
    this.register_hook('get_mx', 'local_gmail_mx_lookup');
}

exports.local_gmail_mx_lookup = function (next, hmail, domain) {
    // Define custom MX settings
    const custom_mx = {
        'gmail.local': { exchange: '127.0.0.1', port: 5571 },
        'localgmail.net': { exchange: '127.0.0.1', port: 5590 },
        'haraka.local': { exchange: '127.0.0.1', port: 2929 },
    };

    if (custom_mx[domain]) {
        const mx = custom_mx[domain];
        return next(OK, [{ exchange: mx.exchange, port: mx.port }]);
    }

    next();
}