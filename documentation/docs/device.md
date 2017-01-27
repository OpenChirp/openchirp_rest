### URLs 

|URL | Supported HTTP verbs|
|:----------|:-----|
|/api/device |  POST|
|/api/device/:id | GET, PUT, DELETE|

### Model 

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id|String| Unique ID for each device| Auto-Generated| -|
|name|String| Name of device| Yes|-|
|type|Enum {LORA, TWIST, FIREFLY, BOSCHXDK}| Type of device.| Yes | -|

### Create new Gateway 

<span class ="operation">POST /api/device/ </span>

- **Request body** 
    * name 
    * location_id
    * type
    * enabled
    * pubsub
    * gateway_id

