const { EmbedBuilder } = require("discord.js");
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: ["removes"], // lệnh phụ
  description: "Xoá 1 bài hát", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand((client, message, args, prefix) => {
  const VoiceChannel = message.member.voice.channel;
  if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
  let newQueue = client.distube.getQueue(message.guildId);
  if(!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
    embeds: [new EmbedBuilder().setColor("Random").setTitle("Danh sách nhạc trống")],
  });
  const { MusicRole } = require(`${process.cwd()}/Events/functions`);
  if(MusicRole(client, message.member, newQueue.songs[0])) return message.reply({
    content: ` Bạn Không có MusicRole hoặc bạn không phải người yêu cầu bài hát\n(${MusicRole(client, message.member, newQueue.songs[0])})`
  });
  if(!args[0]) return message.reply({
    content: "Vui lòng thêm vị trí bài hát"
  });
  let songIndex = Number(args[0]);
  if(!songIndex) return message.reply({
    content: "Vui lòng thêm số vị trí Bài hát!"
  });
  let amount = Number(args[1] ? args[1] : "1");
  if(!amount) amount = 1;
  if(songIndex > newQueue.songs.length - 1) return message.reply({
    content: "**Bài hát này không tồn tại!**\n" + `**Bài hát cuối cùng trong Hàng đợi, Chỉ đến mục: \`${newQueue.songs.length}\`**`,
  });
  if(songIndex <= 0) return message.reply({
    content: `**Bạn không thể xóa Bài hát hiện tại!**`
  });
  if(amount <= 0) return message.reply({
    content: "**Bạn cần xóa ít nhất 1 Bài hát!**"
  });
  newQueue.songs.splice(songIndex, amount);
  return message.reply({
    content: `🗑 **Đã xóa ${amount} Bài hát khỏi Hàng đợi!**`
  });
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;