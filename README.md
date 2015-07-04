# xmpptrix - Matrix.org XMPP Bridge

A WIP xmpp bridge for matrix.org

## Trying it out

### Create application server config

create a yml config:

```yml
#the base URL of the application service
url: "http://localhost:61444"

# This is the token that the AS should use as its access_token when using the Client-Server API
# This can be anything you want.
as_token: mysecret

# This is the token that the HS will use when sending requests to the AS.
# This can be anything you want.
hs_token: myothersecret

# this is the local part of the desired user ID for this AS (in this case @logging:localhost)
sender_localpart: xmppbridge
namespaces:
  users:
    - exclusive: true
      regex: "@xmpp_.*"
  rooms: []
  aliases: []
```

### Add the application server config to the homeserver.yaml

add path to the application server config to the `app_service_config_files` array:

```yml

app_service_config_files:
  -  "/path/to/config.yml"

```


### Change the values in the "settings" section in `index.js`

Line 6-11 contain settings.