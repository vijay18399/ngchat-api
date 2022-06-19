var express = require("express");
var bodyParser = require("body-parser");
var Sentiment = require("sentiment");
const { uuid } = require("uuidv4");
var sentiment = new Sentiment();
var cors = require("cors");
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  return res.status(201).json("Socket API Working");
});

let server = require("http").createServer(app);
let io = require("socket.io")(server);

io.on("connection", (socket) => {
  socket.on("login", (data) => {
    console.log(data);
    io.emit("users-changed", { user: data.username, event: "joined" });
  });
  socket.on("typing", (data) => {
    console.log(data);
    io.emit(data.roomId, { message: data.message, event: "typing" });
  });
  socket.on("message", (data) => {
    console.log(data);
    score = sentiment.analyze(data.message).score;
    io.emit(data.roomId, {
      message: data.message,
      score: score,
      event: "message",
    });
  });
  socket.on("logout", (data) => {
    console.log(data);
    io.emit("users-changed", { user: data.username, event: "left" });
  });
});

var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("socket.io listening in http://localhost:" + port);
});
