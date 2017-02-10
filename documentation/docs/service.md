### URLs 

|URL | Supported HTTP verbs| Action
|:----------|:-------|:-------------|
|/api/service | GET, POST| Return all service, create new service|
|/api/service/{*serviceId*} | GET, PUT, DELETE| Read, update, delete a service|
|/api/service/{*serviceId*}/device/{*deviceId*} | POST | Add device to service |

### Service Resource Description

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id| String| Unique ID of each service| Auto-generated| - |
|name | String| Name of service, example: InfluxDBStorageService | Yes| - |
|description| String| A short description of what this service does | Yes | - |
|pubsub.protocol| Enum {XMPP, MQTT, AMQP}| Pubsub protocol used by this device | No |MQTT|
|pubsub.endpoint| String| Endpoint could be mqtt topic or xmpp node| No |-|
|properties | Mixed| Custom properties of this service. JSON object that can include any number of key-value pairs| No|-|
|device_config|DeviceConfig| Config required from services. | No | -
|devices|Array| Array of devices that are linked to this service. This data is maintained by the database and returned in a GET request| No |-|
