# REST Cheatsheet

# Targets

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
- TODO

## `/admin`
- TODO