### Location Resource

* **URL** /api/location/:id
* **Supported HTTP methods** : GET, PUT, POST, DELETE

| Name | Type | Description |
|:----------|:-----|:------------|


### Create new Location 

<span class ="operation">POST /api/location/:parent_location_id </span>

- **Request parameters**
	* parent_location_id (string) - ID of parent location

- **Request body**
	* name (string) - Name of location to create
	* test(boolean) - If the location is a test


** Example Request **
```http
POST /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
{
	"name":"CIC"
}
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


### Get details of a location
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
### Update Location
<span class ="operation">PUT /api/location/:location_id </span>

- **Request parameters**

	* location_id (string) - ID of location to update

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

### Delete a location
<span class ="operation">DELETE /api/location/:location_id </span>

- **Request parameters**

	* location_id (string) - ID of location to delete

** Example Request **
```http
DELETE /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
```