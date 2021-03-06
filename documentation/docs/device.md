### URLs


|URL | Supported HTTP verbs| Action
|:----------|:-------|:-------------|
|/api/device |  POST| Create new device |
|/api/device/{*deviceId*} | GET, PUT, DELETE| Read, Update , Delete a device|
|/api/device/{*deviceId*}/transducer | POST, GET | Create new transducer, get all transducers for a given device|
|/api/device/{*deviceId*}/transducer/{*transducerId*}| POST,  DELETE| Publish to, Delete a transducer|

### Device Resource Description

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id|String| Unique ID for each device| Auto-Generated| -|
|name|String| Name of device| Yes|-|
|type|Enum {LORA, TWIST, FIREFLY, BOSCH_XDK}| Type of device.| Yes | -|
|location_id| String| Location ID |
|enabled | Boolean| If set to false, then the device is not monitored| No | True|
|pubsub.protocol| Enum {XMPP, MQTT, AMQP}| Pubsub protocol used by this device | No |MQTT|
|pubsub.endpoint| String| Endpoint could be mqtt topic or xmpp node| No |-|
|properties | Mixed| JSON object that can include any number of key-value pairs| No|-|
|transducers| Array of Transducers | See the transducer resource description for more details.| No|-|


### Create new Device

<span class ="operation">POST /api/device/ </span>

- **Request body**
    * name
    * location_id
    * type
    * enabled
    * pubsub
