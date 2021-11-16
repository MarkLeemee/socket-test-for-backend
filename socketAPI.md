# Client Emit (C2S)

## Table Header

- checkTableName

```json
{
  "check_name": "string"
}
```

- changeTableName

```json
{
  "comparison_id": 0,
  "comparison_name": "string",
  "is_p_value": false
}
```

## Cohort

- addCohort
- changeAlias
- deleteCohort (삭제 시에는 el을 null로)

```json
{
  "cohort_alias_list": ["string"],
  "cohort_id_list": [0],
  "comparison_id": 0
}
```

## Vairable

- addVariable

```json
{
  "comparison_id": 0,
  "information_type": "count",
  "order": 0,
  "variable_type": "age"
}
```

- deleteVariable

```json
{
  "comparison_id": 0,
  "order": 0
}
```

# Server Emit Date Type

## tableState (1차 res)

- addCohort
- changeAlias
- deleteCohort
- addVariable
- deleteVariable

```json
{
  "cohortIdList": [0],
  "variableTypeList": ["age"],
  "reqTime": "time format"
}
```

## tableData (2차 res)

- addCohort
- changeAlias
- addVariable
- deleteCohort (cohort 삭제 시에는 save와 동일하게 체크하는 로직)

```json
{
  "comparisonInfo": {
    "cohortAliasList": ["string"],
    "cohortIdList": [0],
    "comparisonVariableList": [
      {
        "comparisonId": 0,
        "informationType": "string",
        "order": 0,
        "pValue": {},
        "property": "string",
        "result": [{}],
        "variableType": "string"
      }
    ],
    "id": 0,
    "isPValue": true,
    "name": "string",
    "totalCountList": [0],
    "updatedTime": "string"
  },
  "reqTime": "time format"
}
```

- deleteVariable (variable 삭제 시에는 어떻게 체크해야 할까?)

```json
{
  "msg": "string",
  "msgId": "string"
}
```
