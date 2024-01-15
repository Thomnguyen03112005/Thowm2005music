const { Prefix: prefixDB } = require(`${process.cwd()}/Assets/Schemas/database`);
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: ["changerprefix"], // lệnh phụ
  description: "thiết lập prefix cho guilds", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: ["Administrator"] // quyền hạn khi sử dụng lệnh
}).addCommand(async(client, message, args, prefix) => {
    if(!args[0]) return message.reply({
      content: "Vui lòng nhập prefix bạn muốn đặt"
    });
    let newPrefix = args[0];
    // Lấy dữ liệu guilds hiện tại từ cơ sở dữ liệu 
    const guildData = await prefixDB.findOne({ GuildId: message.guild.id });
    if(!guildData) return new prefixDB({
      GuildId: message.guild.id
    });
    // Cập nhật thuộc tính setDefaultVolume với giá trị mới
    guildData.setDefaultPrefix = newPrefix;
    // thiết lập thuộc tính với giá trị mới
    await guildData.save();
    return message.reply({
      content: `Prefix đã được đặt thành ${newPrefix}`
    }); 
});

// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;