const { Music: database } = require(`${process.cwd()}/Assets/Schemas/database`);
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: ["autoplaydf"], // lệnh phụ
  description: "Thiết lập chế độ mặc định tự động phát nhạc", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: ["Administrator"] // quyền hạn khi sử dụng lệnh
}).addCommand(async(client, message, args, prefix) => {
    const guildData = await database.findOne({ GuildId: message.guild.id });
    if(!args[0]) return message.reply({
      content: "Vui lòng chọn true: bật hoặc false: tắt"
    });
    if(args[0] === "bật") {
      var autoplay = Boolean(args[0]);
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    } else {
      var autoplay = Boolean(args[1]);
      guildData.setDefaultMusicData.DefaultAutoplay = autoplay;
    };
    await guildData.save();
    return message.reply({
      content: ` Chế độ tự động phát đã được ${autoplay ? "bật" : "tắt"}`
    }); 
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;