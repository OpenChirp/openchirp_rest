
### URLs 

|URL | Supported HTTP verbs| Action
|:----------|:-------|:-------------|
|/api/gateway | GET, POST| Return all gateways, create new gateway|
|/api/gateway/{*gatewayId*} | GET, PUT, DELETE| Read, update, delete a gateway|
|/api/gateway/{*gatewayId*}/devices/ | GET | Get devices linked to a gateway |

### Gateway Resource Description

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id|String| Unique ID for each gateway| Auto-Generated| -|
|name|String| Name of gateway| Yes|-|
|type|Enum {LORA, ZIGBEE}| Type of gateway.| Yes | -|
|location_id| String| Location ID | 
|enabled | Boolean| If set to false, then the gateway is not monitored| No | True|
|pubsub.protocol| Enum {XMPP, MQTT, AMQP}| Pubsub protocol used by this gateway | No |MQTT|
|pubsub.endpoint| String| Endpoint could be mqtt topic or xmpp node| No |-|
|properties | Mixed| JSON object that can include any number of key-value pairs| No|-|
|transducers| Array of Transducers| See the transducer resource description for more details | No|-|

### Create new Gateway 

<span class ="operation">POST /api/gateway/ </span>

- **Request body** 
    * name 
    * location_id
    * type
    * enabled
    * pubsub

** Example Request **
```http
POST /api/gateway HTTP/1.1
{
    "name": "LabGateway",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/LabGateway"
    } 
}
```

** Example Response **
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "_id": "5873dfefc653394e3f0966b9",
    "name": "LabGateway",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "__v": 0,
    "enabled": true,
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/LabGateway"
    }  
}
```

### Get all gateways
<span class ="operation">GET /api/gateway/ </span>

** Example Request **
```http
GET /api/gateway HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
Content-Type: application/json

 [
  {
    "_id": "5873dfefc653394e3f0966b9",
    "name": "LabGateway",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "__v": 0,
    "enabled": true,
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/LabGateway"
    }
  },
  {
    "_id": "587e9cf0ee4cf540f8590784",
    "name": "CICGateway",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "__v": 0,
    "enabled": true,
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/CICGateway"
    }
 ]    

```

### Get details of a gateway
** Request URL **

<span class ="operation">GET /api/gateway/{*gatewayId*} </span>

- **Request parameters**
	* id (string) - ID of gateway to get.

** Example Request **

```http
GET /api/gateway/587e9cf0ee4cf540f8590784 HTTP/1.1

```

** Example Response **

```http
HTTP/1.1 200 OK
Content-Type: application/json
{
    "_id": "587e9cf0ee4cf540f8590784",
    "name": "CICGateway",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "__v": 0,
    "enabled": true,
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/CICGateway"
    }
}
```
### Update gateway
<span class ="operation">PUT /api/gateway/{*gatewayId*} </span>

- **Request parameters**
	* id (string) - ID of gateway to update

- **Request body** 
	* name 
	* location_id
    * type
    * enabled
    * pubsub

** Example Request **
```http
PUT /api/gateway/587e9cf0ee4cf540f8590784 HTTP/1.1

{
	"name" : "CICGateway_Lab"
}
```

** Example Response **
```http
HTTP/1.1 200 OK
{
    "_id": "587e9cf0ee4cf540f8590784",
    "name": "CICGateway_Lab",
    "location_id": "5833479babdafd7b34858958",
    "type": "LORA",
    "__v": 0,
    "enabled": true,
    "pubsub": {
      "protocol": "MQTT",
      "endpoint": "/gateways/CICGateway"
    }
}
```

### Delete a gateway
<span class ="operation">DELETE /api/gateway/{*gatewayId*} </span>

- **Request parameters**

	* id (string) - ID of gateway to delete

** Example Request **
```http
DELETE /api/gateway/582e2b2c065b2545ded3aabd HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
```

