```bash
http -a admin:ifpiifpi post localhost:3000/update_bus_location/ lat = -9.0461434 lng = -42.6924502 --print = HBhb
```

```sql
INSERT INTO bus_location(id, latitude,longitude)
  VALUES(1, -9.0461434, -42.6924502)
  ON CONFLICT(id) DO UPDATE SET
	latitude=-9.0461434,
	longitude=-42.6924502,
	timestemp=CURRENT_TIMESTAMP;
```
