### URLs 

|URL | Supported HTTP verbs| Action
|:----------|:-------|:-------------|
|/api/service | GET, POST| Return all services, create new service|
|/api/service/{*serviceId*} | GET, PUT, DELETE| Read, update, delete a service|
|/api/service/{*serviceId*}/thing/ | POST | Link a thing to this service |

### Service Resource Description

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id| String| Unique ID of each service| Auto-generated| - |
|name | String| Name of service, example: InfluxDBStorageService.| Yes| - |
|description| String| A short description of what this service does.| Yes | - |
|pubsub.protocol| Enum {XMPP, MQTT, AMQP}| Pubsub protocol used by this service. | No |MQTT|
|pubsub.endpoint| String| Endpoint could be mqtt topic or xmpp node| No |-|
|properties | Mixed| Custom properties of this service. JSON object that can include any number of key-value pairs| No|-|
|things_config|ThingsConfig| Config required from things when they link to this service. | No | -
|things|Array| Array of things(devices, gateways etc..) that are linked to this service. This data is maintained by the database and returned in a GET request| No |-|
