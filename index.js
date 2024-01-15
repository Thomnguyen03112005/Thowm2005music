const Client = require("./Events/Client");
const config = require("./config.json");
const fs = require("node:fs");
// require("dotenv").config() // sử dụng process.env trên visual studio code
const client = new Client({
  setMongoURL: process.env.mongourl || config.mongourl,
  setToken: process.env.token || config.token,
});

// chạy các events bên ngoài
fs.readdirSync('./Handlers').forEach((BlackCat) => {
  require(`./Handlers/${BlackCat}`)(client);
});