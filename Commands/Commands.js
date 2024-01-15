/*========================================================
# Commands
========================================================*/
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: [], // lệnh phụ
  description: "", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand((client, message, args, prefix) => {

});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;
/*========================================================
# slashCommands
========================================================*/
const { ApplicationCommandOptionType } = require("discord.js");
const { slashCommandBuilder } = require(`${process.cwd()}/Events/functions`);
// cấu trúc yêu cầu
const slashCommand = new slashCommandBuilder({
  name: "", // Tên lệnh 
  description: "", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: []
}).addSlashCommand((client, interaction) => {
  // code
});
// console.log(slashCommand.toJSON());
module.exports = slashCommand;
/*========================================================
# modules 
========================================================*/
module.exports = (client) => {
  const path = require("node:path");
  const description = {
    name: path.parse(__filename).name,
    filename: path.parse(__filename).name,
    version: "5.0"
  };
  console.log(` :: ⬜️ modules: ${description.name} | Phiên bản đã tải ${description.version} Từ ("${description.filename}")`.red);
  // code
};
/*========================================================
# Events
========================================================*/
const events = new eventBuilders({
  eventCustomName: "name custom", // Tên events tùy chỉnh
  eventName: "", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client) => {
    // code
  },
});