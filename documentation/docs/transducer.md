
### Transducer Resource Description

| Name | Type | Description | Required | Default|
|:----------|:-----|:------------|:----|:--------|
|_id| String| Unique ID of each transducer| Auto-generated| - |
|name | String| Name of transducer, example: Temperature| Yes| - |
|unit| String| Unit of transducer, example: Celsius | Yes | - |
|is_actuable| Boolean | If the transducer can be actuated | No | False|
|properties | Mixed| JSON object that can include any number of key-value pairs| No|-|