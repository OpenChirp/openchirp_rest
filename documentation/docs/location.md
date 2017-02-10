### URLs

|URL | Supported HTTP verbs| Action
|:----------|:-------|:-------------|
|/api/location| GET | Get Root Location|
|/api/location/{*parentLocationId*} |POST| Create new location under a given parent location|
|/api/location/{*locationId*} | GET, PUT, DELETE| Create, read, update, delete a location respectively|
|/api/location/{*locationId*}/gateways| GET| Get all gateways at a location|
|/api/location/{*locationId*}/devices| GET| Get all devices at a location|

### Location Resource Description
| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:-----|:-------|
|_id|String| Unique ID of location| Auto-Generated|-|
|name|String| Name of location| Yes|-|
|type|Enum {BUILDING, INDOOR}| If the location is a building or an indoor location inside a building. If this location is a building, then geoLoc should be set| No | -|
|test | Boolean| If set to true, then the location is not visible in tree| No | False|
|geoLoc.type | String| Type of geo-location : Point, Line etc| No| Point|
|geoLoc.coordinates|Number| Coordinates are in format [longitude, latitude]| No| -| 
|children| Array | Pointer to child locations is maintained by database and returned in GET request|No | -|


### Create new Location 

<span class ="operation">POST /api/location/{*parentLocationId*} </span>

- **Request parameters**
	* parentLocationId (string) - ID of parent location

- **Request body**

	* name 
	* test
  * type
  * geoLoc

** Example Request **
```http
POST /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
{
	"name":"CIC",
  "type":"BUILDING",
    "geoLoc": {
      "coordinates": [
        40.4509146,
        -79.9024777
      ]     
    }    
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
    "type":"BUILDING"
    "children": [
     {}
    ],
    "geoLoc": {
      "coordinates": [
        40.4509146,
        -79.9024777
      ],
      "type": "Point"
    }
}
```


### Get details of a location
** Request URL **

<span class ="operation">GET /api/location/{*locationId*} </span>

- **Request parameters**
	* locationId (string) - ID of location to get.

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
<span class ="operation">PUT /api/location/{*locationId*} </span>

- **Request parameters**

	* locationId (string) - ID of location to update

- **Request body** 

	* name 
	* test
  * type
  * geoLoc

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
<span class ="operation">DELETE /api/location/{*locationId*} </span>

- **Request parameters**

	* locationId (string) - ID of location to delete

** Example Request **
```http
DELETE /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
```

** Example Response **
```http
HTTP/1.1 200 OK
```

### Find gateways at a location 
<span class ="operation">GET /api/location/{*locationId*}/gateways</span>

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

<span class ="operation">GET /api/location/{*locationId*}/devices </span>

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
