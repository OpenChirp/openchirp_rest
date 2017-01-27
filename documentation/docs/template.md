### URLs

|URL | Supported HTTP verbs|
|:----------|:-----|
|/api/location/:id | GET, PUT, POST, DELETE|

### Model
| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:-----|:-------|



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