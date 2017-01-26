### Location Resource

* **URL** /api/location/:id
* **Supported HTTP methods** : GET, PUT, POST, DELETE

| Name | Type | Description |
|:----------|:-----|:------------|

### Create new Location 

<span class ="operation">POST /api/location/:parent_location_id </span>


** Request parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
|parent_location_id|string| ID of parent location|


** Request body **

| Parameter | Type | Description |
|:----------|:-----|:------------|


** Example Request **
```http
POST /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
```
** Example Response **
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "_id": "string",
    "name": "string",
    "test": false,
    "children": [
     {}
    ]
}
```


### Get details of a location
** Request URL **

```http
GET /api/location/:id
```

** Request parameters**

In the request URL, provide the following parameters with values.

| Parameter | Type | Description |
|:----------|:-----|:------------|


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
### Delete a location


** Request URL **

```http
DELETE /api/location/:id
```

** Request parameters**

In the request URL, provide the following parameters with values.

| Parameter | Type | Description |
|:----------|:-----|:------------|
|id|string| ID of location to delete|

** Example Request **

```http
DELETE /api/location/582e2b2c065b2545ded3aabd HTTP/1.1
```

** Example Response **

```http
HTTP/1.1 200 OK
```