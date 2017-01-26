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

