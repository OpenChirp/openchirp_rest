# REST/MQTT Cheatsheet

# REST Targets

## `/user`
- GET - Fetch user profile info
- PUT - Update user info
* `/token`
    - GET - Simply get's the user's real id
    - POST - Generate a user token
    - DELETE - Delete the user's token
* `/mydevices`
    - GET
* `/mylocations`
    - GET
* `/shortcuts`
    - GET - Get all user shortcuts
    - POST - Create a user shortcut
* `/shortcuts/<shct_id>`
    - DELETE - Delete the user shortcut
* `/group/<grp_id>`
    - DELETE - Leave group
* `/all`
    - GET - Get's all the user's information

## `/group`
- GET- Fetch all group info
- TODO


## `/location`
- GET - Get root location
- POST - Create new location at root

* `<loc_id>`
    - GET - Fetch location info
    - POST - Create new child location
    - PUT - Update a location
    - DELETE - Delete location

    * `/devices`
        - GET - Fetch immediate devices
    * `/alldevices`
        - GET - Fetch recursive all devices


## `/device`
- GET - Get all devices' info (You can actually ask for all devices)
- POST - Create new device

* `/<dev_id>`
    - GET - Get the device's info
    - PUT - Update the device
    - DELETE - Delete the device

    * `/transducer`
        - GET - Fetch all transducers' info
        - POST - Create a new transducer
    * `/transducer/<trans_id>`
        - GET - Get info about transducer
        - POST - Publish data to transducer
        - DELETE - Delete the transducer

    * `/token`
        - PUT
        - DELETE

    * `/command`
        - GET - Get list of commands
    * `/command/<cmd_id>`
        - GET
    * `/command/<cmd_id>/publiclink`
        - GET
        - POST

    * `/service/<srv_id>`
        - POST
        - PUT
        - DELETE

    * `/acl/users`
        - GET
    * `/acl/groups`
        - GET
    * `/acl/<user_or_group_id>`
        - POST - Grant access to user or group
        - PUT - Update access to user or group
        - DELETE - Remove access to user or group


## `/devicetemplate`
- TODO

## `/service`
- GET - Get all services
    <details>
    <summary>Example Response</summary>
    <pre>
    [
        {
            "_id": "592880c57d6ec25f901d9668",
            "updated_at": "2018-03-04T03:17:40.541Z",
            "created_at": "2017-05-26T19:23:49.953Z",
            "owner": {
                "_id": "5911f5ab65dd1376d1996d3f",
                "email": "hesling.craig@gmail.com",
                "name": "Craig Hesling",
                "id": "5911f5ab65dd1376d1996d3f"
            },
            "name": "LoRaWAN",
            "description": "LoRaWAN device registration",
            "__v": 22,
            "properties": {
                "AppServerTarget": "something",
                "AppServerApplicationID": "somenumber"
            },
            "config_required": [
                {
                    "key_name": "DevEUI",
                    "key_description": "A device's unique identifier (8 byte hexadecimal)",
                    "key_example": "1122334455667788",
                    "key_required": true
                },
            ],
            "status": {
                "timestamp": "2018-03-04T03:17:40.541Z",
                "message": "Running"
            },
            "pubsub": {
                "protocol": "MQTT",
                "endpoint": "openchirp/services/592880c57d6ec25f901d9668",
                "events_endpoint": "openchirp/services/592880c57d6ec25f901d9668/thing/events",
                "status_endpoint": "openchirp/services/592880c57d6ec25f901d9668/status"
            },
            "device_permission": 0,
            "id": "592880c57d6ec25f901d9668"
        }
    ]
    </pre>
    </details>
- POST - Create a new service

* `/<srv_id>`
    - PUT - Update service settings
    - DELETE - Delete a service

    * `/things`
        - GET - Get all linked devices list/info
    * `/token`
        - POST - Generate the service token
        - PUT - Regenerate the service token
        - DELETE - Delete the service token

## `/admin`
- TODO

# MQTT Targets

* `openchirp/device/<dev_id>`
    - `/transducer/<any_topic>` - Time series recorded transducer topics
    - `/<any_topic>` - Topics for device related communication that should not
      be recorded by time series.
* `openchirp/service/<srv_id>`
    - `/thing/events`
        <details>
        <summary>Example Device Event - New</summary>
        <pre>
            {
                "action":"new",
                "thing":{
                    "type":"device",
                    "id":"5aa7198f69da9508643081c1",
                    "pubsub":{
                        "protocol":"MQTT","endpoint":"openchirp/device/5aa7198f69da9508643081c1"
                    },
                    "config":[
                        {"key":"rxconfig","value":"blahRX"},
                        {"key":"txconfig","value":"blahTX"}
                    ]
                }
            }
        </pre>
        </details>
        <details>
        <summary>Example Device Event - Update</summary>
        <pre>
            {
                "action":"update",
                "thing":{
                    "type":"device",
                    "id":"5aa7198f69da9508643081c1",
                    "pubsub":{
                        "protocol":"MQTT","endpoint":"openchirp/device/5aa7198f69da9508643081c1"
                    },
                    "config":[
                        {"key":"rxconfig","value":"blahNewRX"},
                        {"key":"txconfig","value":"blahTX"}
                    ]
                }
            }
        </pre>
        </details>
        <details>
        <summary>Example Device Event - Delete</summary>
        <pre>
            {
                "action":"delete",
                "thing":{
                    "type":"device",
                    "id":"5aa7198f69da9508643081c1",
                    "pubsub":{
                        "protocol":"MQTT",
                        "endpoint":"openchirp/device/5aa7198f69da9508643081c1"
                    }
                }
            }
        </pre>
        </details>
    - `/status` - Dual use, push device-service link status and service's main status.