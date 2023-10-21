CREATE TABLE IF NOT EXISTS bus_location (
    id INT PRIMARY KEY,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timestemp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)

-- INSERT INTO bus_location(id, latitude,longitude)
--  VALUES(1, -9.0461434, -42.6924502)
--  ON CONFLICT(id) DO UPDATE SET
--	latitude=-9.0461434,
--	longitude=-42.6924502,
--	timestemp=CURRENT_TIMESTAMP;
