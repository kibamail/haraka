# Haraka Logging

Haraka has built-in logging (see API docs below) and support for log plugins.

- log.ini

Contains settings for log level, timestamps, and format. See the example log.ini file for examples.

- loglevel

The loglevel file provides a finger-friendly way to change the loglevel on the CLI. Use it like so: `echo DEBUG > config/loglevel`. When the level in log.ini is set and the loglevel file is present, the loglevel file wins. During runtime, whichever was edited most recently wins.

## Logging API

Logging conventions within Haraka

This section pertains to the built in logging. For log plugins like ([haraka-plugin-syslog](https://github.com/haraka/haraka-plugin-syslog)), refer to the plugin's docs.

The logline by default will be in the form of:

    [level] [uuid] [origin] message

Where origin is "core" or the name of the plugin which triggered the message, and "uuid" is the ID of the connection associated with the message.

When calling a log method on logger, you should provide the plugin object and the connection object anywhere in the arguments
to the log method.

    logger.logdebug("i like turtles", plugin, connection);

Will yield, for example,

    [DEBUG] [7F1C820F-DC79-4192-9AA6-5307354B20A6] [dnsbl] i like turtles

If you call the log method on the connection object, you can forego the connection as argument:

    connection.logdebug("turtles all the way down", plugin);

and similarly for the log methods on the plugin object:

    plugin.logdebug("he just really likes turtles", connection);

failing to provide a connection and/or plugin object will leavethe default values in the log (currently "core").

This is implemented by testing for argument type in the logger.js log\* method. objects-as-arguments are then sniffed to try to determine if they're a connection or plugin instance.

### Log formats

Apart from the default log format described above, Haraka also supports logging as [`logfmt`](https://brandur.org/logfmt) and JSON. These can be used by changing the `format` attribute in `log.ini` to the desired format, e.g.:

```ini
; format=default
; format=json
format=logfmt
```

Here's an example of a log line generated with `logfmt`:

    level=PROTOCOL uuid=9FF7F70E-5D57-435A-AAD9-EA069B6159D9.1 source=core message="S: 354 go ahead, make my day"

And the same line formatted as JSON:

```json
{
  "level": "PROTOCOL",
  "uuid": "9FF7F70E-5D57-435A-AAD9-EA069B6159D9.1",
  "source": "core",
  "message": "S: 354 go ahead, make my day"
}
```

Any objects passed to the log methods will also have their properties included in the log line. For example, using `logfmt`:

    level=NOTICE uuid=9FF7F70E-5D57-435A-AAD9-EA069B6159D9.1 source=core message=disconnect ip=127.0.0.1 rdns=Unknown helo=3h2dnz8a0if relay=N early=N esmtp=N tls=N pipe=N errors=0 txns=1 rcpts=1/0/0 msgs=1/0/0 bytes=222 lr="" time=0.052

And using JSON:

```json
{
  "level": "NOTICE",
  "uuid": "9FF7F70E-5D57-435A-AAD9-EA069B6159D9.1",
  "source": "core",
  "message": "disconnect",
  "ip": "127.0.0.1",
  "rdns": "Unknown",
  "helo": "3h2dnz8a0if",
  "relay": "N",
  "early": "N",
  "esmtp": "N",
  "tls": "N",
  "pipe": "N",
  "errors": 0,
  "txns": 1,
  "rcpts": "1/0/0",
  "msgs": "1/0/0",
  "bytes": 222,
  "lr": "",
  "time": 0.052
}
```
