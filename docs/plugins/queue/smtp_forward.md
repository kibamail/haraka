# queue/smtp_forward

==================

This plugin delivers to another mail server. This is a common setup when you want to have a mail server with a solid pedigree of outbound delivery to other hosts, and inbound delivery to users.

In comparison to `queue/smtp_proxy`, this plugin waits until queue time to attempt the ongoing connection. This can be a benefit in reducing connections to your inbound mail server when you have content filtering (such as spamassassin) enabled. A possible downside is that it also delays recipient validation that the ongoing mail server may provide until queue time.

## Configuration

---

Configuration is stored in smtp_forward.ini in the following keys:

- enable_outbound=[true]

  SMTP forward outbound messages (set to false to enable Haraka's separate Outbound mail routing (MX based delivery)).

- host=HOST

  The host to connect to.

- port=PORT

  The port to connect to. Default: 25

- connect_timeout=SECONDS

  The maximum amount of time to wait when creating a new connection to the host. Default: 30 seconds.

- timeout=SECONDS

  The amount of seconds to let a backend connection live idle in the connection pool. This should always be less than the global plugin timeout, which should in turn be less than the connection timeout.

- max_connections=NUMBER

  Maximum number of connections at any given time. Default: 1000

- enable_tls=[true]

  Enable TLS with the forward host (if supported). TLS uses options from the tls plugin. If key and cert are provided in the the outbound section of the tls plugin, that certificate will be used as a TLS Client Certificate.

  This option controls the use of TLS via `STARTTLS`. This plugin does not work with SMTP over TLS.

- auth_type=[plain\|login]

  Enable PLAIN or LOGIN SMTP AUTH. This is required to enable AUTH.

- auth_user=USERNAME

  SMTP AUTH username to use.

- auth_pass=PASSWORD

  SMTP AUTH password to use.

- queue

  Which queue plugin to use. Default: undefined. The default bahavior is to use smtp_forward for inbound connections and outbound for relaying connections. This option is used for complex mail routes.

- check_sender=false

  Requires that sender domains defined in smtp_forward.ini (see Per-Domain below) have relaying privileges. This is a form of spoof prevention and assumes that any mail clients have relaying or AUTH privileges. This is usually the case.

- check_recipient=false

  By default, Haraka accepts no emails until a recipient plugin has been configured to accept mails for a domain. The simplest common case is the in_host_list plugin with a list of domains in config/host_list. An alternative is to set `check_recipient=true` and list each domain in a definition block in smtp_forward.ini (see Per-Domain Configuration). An example for two domains:

  [example.com]
  [example.net]

# Per-Domain Configuration

More specific forward routes for domains can be defined. The domain is chosen based on the value of the `domain_selector` config variable.

When `domain_selector` is set to `rcpt_to` (the default), more specific routes are only honored for SMTP connections with a single recipient or SMTP connections where every recipient host is identical.

When `domain_selector` is set to `mail_from`, the domain of the MAIL FROM address is used.

enable_outbound can be set or unset on a per-domain level to enable or disable forwarding for specific domains.

    # default SMTP host
    host=1.2.3.4
    # auth_type=plain
    # auth_user=user
    # auth_user=pass

    [example1.com]
    host=1.2.3.5
    # auth_type=plain
    # auth_user=user
    # auth_pass=pass

    [example2.com]
    host=1.2.3.5

    [example3.com]
    host=1.2.3.6

    [example4.com]
    enable\_outbound=false

# Split host forward routing

When an incoming email transaction has multiple recipients with different forward routes, recipients to subsequent forward routes are deferred. Example: an incoming email transaction has recipients user@example1.com, user@example2.com, and user@example3.com. The first two recipients will be accepted (they share the same forward destination) and the latter will be deferred. It will arrive in a future delivery attempt by the remote.
