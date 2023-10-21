import http from "node:http";
import { Buffer } from "node:buffer";
import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";
import configs from "./configs.js";

const database = new sqlite3.Database(configs.DATABASE);

database.serialize(() => {
  const schema = fs.readFileSync(configs.SCHEMA).toString();
  database.run(schema);
});

function handleStatic404(response) {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain");
  response.end("File Not Found");
}

function handle401(response) {
  response.statusCode = 401;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ msg: "Unauthorized" }));
}

function handle400(response) {
  response.statusCode = 400;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify({ msg: "Invalid Payload!" }));
}

function getIndex(request, response) {
  fs.readFile("./public/index.html", function (err, data) {
    if (err) {
      handleStatic404(response);
      return;
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html");
    response.end(data);
  });
}

function getStatic(request, response) {
  const mediaTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".css": "text/css",
    ".js": "text/javascript",
    ".html": "text/html",
  };

  const filePath = request.url.replace("/static/", "./public/");
  const extension = path.extname(filePath);
  fs.readFile(filePath, function (err, data) {
    if (err) {
      handleStatic404(response);
      return;
    }
    response.statusCode = 200;
    response.setHeader("Content-Type", mediaTypes[extension]);
    response.end(data);
  });
}

function getLastBusPosition(request, response) {
  database.get("SELECT * FROM bus_location WHERE id = 1", function (err, row) {
    if (err || !row) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ msg: "Location Not Found" }));
      return;
    }

    const lastLocation = {
      lat: row["latitude"],
      lng: row["longitude"],
      timestemp: row["timestemp"],
    };

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(lastLocation));
  });
}

function updateLastBusPosition(request, response) {
  let data = "";
  request.on("data", function (chunk) {
    data += chunk;
  });
  request.on("end", function () {
    if (request.headers.authorization) {
      const authHeader = request.headers.authorization.split(" ")[1];
      const authData = Buffer.from(authHeader, "base64").toString().split(":");
      const username = authData[0];
      const password = authData[1];
      if (username === configs.USERNAME && password === configs.PASSWORD) {
        try {
          const lastLocation = JSON.parse(data);

          database.run(
            `INSERT INTO bus_location(id, latitude,longitude) VALUES(?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              latitude=?,
              longitude=?,
              timestemp=CURRENT_TIMESTAMP`,
            [
              1,
              lastLocation.lat,
              lastLocation.lng,
              lastLocation.lat,
              lastLocation.lng,
            ]
          );

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(lastLocation));
        } catch (e) {
          console.error(e);
          handle400(response);
        }
      } else {
        console.error("Unauthorized");
        handle401(response);
      }
    } else {
      console.error("Unauthorized");
      handle401(response);
    }
  });
}

const server = http.createServer((request, response) => {
  const startTime = new Date();
  
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", true);
  response.setHeader("Access-Control-Allow-Credentials", true);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST");

  if (request.method == "GET" && request.url == "/") {
    getIndex(request, response);
  }
  if (request.method == "GET" && request.url.startsWith("/static/")) {
    getStatic(request, response);
  }
  if (request.method == "GET" && request.url == "/get_last_position") {
    getLastBusPosition(request, response);
  }
  if (request.method == "POST" && request.url == "/update_last_position") {
    updateLastBusPosition(request, response);
  }

  const endTime = new Date();
  const diff = endTime.getTime() - startTime.getTime();
  console.info(request.method, request.url, "in", diff, "milliseconds");
});

server.listen(configs.PORT, configs.HOSTNAME, () => {
  console.log(`Server running at http://${configs.HOSTNAME}:${configs.PORT}/`);
});
