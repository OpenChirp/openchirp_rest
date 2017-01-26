### Gateway Resource

* **URL** /api/gateway/:id
* **Supported HTTP methods** : GET, PUT, POST, DELETE

| Name | Type | Description |
|:----------|:-----|:------------|


### Create new Gateway 

<span class ="operation">POST /api/gateway/ </span>

- **Request body**
	* name (string) - Name of gateway
	* enabled(boolean) - If the gateway is enabled


** Example Request **
```http
POST /api/gateway HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "_id": "5833479babdafd7b34858958",
    "name": "CIC",
    "test": false,
    "children": [
     {}
    ]
}
```


### Get details of a gateway
** Request URL **

<span class ="operation">GET /api/location/:location_id </span>

- **Request parameters**
	* location_id (string) - ID of location to get.

** Example Request **

```http
GET /api/location/582e2b2c065b2545ded3aabd HTTP/1.1

```

** Example Response **

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "_id": "582e2b2c065b2545ded3aabd",
    "name": "CMU",
    "test": false,
    "children": [
     	"5833479babdafd7b34858958"
    ]
}

```
### Update gateway
<span class ="operation">PUT /api/gateway/:id </span>

- **Request parameters**

	* id (string) - ID of gateway to update

- **Request body** 
	* name(string) 
	* test(boolean)

** Example Request **
```http
PUT /api/location/582e2b2c065b2545ded3aabd HTTP/1.1

{
	"name" : "CMU Campus"
}
```

** Example Response **
```http
HTTP/1.1 200 OK
{
    "_id": "582e2b2c065b2545ded3aabd",
    "name": "CMU Campus",
    "test": false,
    "children": [
     	"5833479babdafd7b34858958"
    ]
}
```

### Delete a gateway
<span class ="operation">DELETE /api/gateway/:id </span>

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