# xmpptrix - Matrix.org XMPP Bridge

A WIP xmpp bridge for matrix.org

## TODO
* Presence change
* Better errorhandling
* More logging
* Set powerlevel for user to op, so room name can be properly changed
* handle leaving the room (re-invite on new message)
* handle adding user to roster (adding @xmpp_* prefixed user)
* MUC

## Setup

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


### Running the setup and adding an account

First run `setup.js`, after that run `create_account` to add an xmpp account.

Run the bridge with `node index.js`. You will get an invide for every contact in your roster. This might take a few seconds.
