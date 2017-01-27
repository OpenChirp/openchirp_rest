### URLs

|URL | Supported HTTP verbs|
|:----------|:-----|
|/api/location/:id | GET, PUT, POST, DELETE|
|/api/location/:id/gateways| GET|
|/api/location/:id/devices| GET|

### Model
| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:-----|:-------|
|_id|String| Unique ID of location| Auto-Generated|-|
|name|String| Name of location| Yes|-|
|isBuilding|Boolean| If this location is building, then geoLoc should be set| No | False|
|test | Boolean| If set to true, then the location is not visible in tree| No | False|
|geoLoc.type | String| Type of geo-location : Point, Line etc| No| Point|
|geoLoc.coordinates|Number| Coordinates are in format [longitude, latitude]| No| -| 
|children| Array | Pointer to child locations is maintained by database and returned in GET request|No | -|


### Create new Location 

<span class ="operation">POST /api/location/:parent_location_id </span>

- **Request parameters**
	* parent_location_id (string) - ID of parent location

- **Request body**
	* name 
	* test
    * isBuilding
    * geoLoc


** Example Request **
```http
POST /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
{
	"name":"CIC",
    "geoLoc": {
      "coordinates": [
        40.4509146,
        -79.9024777
      ]     
    },
    "isBuilding": true
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
    ],
    "geoLoc": {
      "coordinates": [
        40.4509146,
        -79.9024777
      ],
      "type": "Point"
    },
    "isBuilding": true
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
<span class ="operation">DELETE /api/location/:id </span>

- **Request parameters**

	* id (string) - ID of location to delete

** Example Request **
```http
DELETE /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
```

### Find gateways at a location 
<span class ="operation">GET /api/location/:id/gateways</span>

- **Request parameters**

    * id (string) - Location ID

** Example Request **
```http
GET /api/location/582e2b2c065b2545ded3aabd/gateways HTTP/1.1
```

** Example Response **
```http
TODO
```

### Find devices at a location

<span class ="operation">GET /api/location/:id/devices </span>

- **Request parameters**

    * id (string) - Location ID

** Example Request **
```http
GET /api/location/582e2b2c065b2545ded3aabd/devices HTTP/1.1
```
** Example Response **
```http
TODO
```
