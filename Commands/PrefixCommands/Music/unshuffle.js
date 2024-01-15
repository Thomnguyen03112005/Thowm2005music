const { EmbedBuilder } = require("discord.js");
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: [], // lệnh phụ
  description: "Bỏ Xáo trộn hàng đợi", // mô tả dành cho lệnh
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
  if(!client.maps.has(`beforeshuffle-${newQueue.id}`))	return message.reply({ 
    content: "**Trước đây không có trộn bài!**"
  });
  newQueue.songs = [newQueue.songs[0], ...client.maps.get(`beforeshuffle-${newQueue.id}`)]
  client.maps.delete(`beforeshuffle-${newQueue.id}`);
  return message.reply({
    content: `🔀 **Đã hủy ${newQueue.songs.length} bài hát bị xáo trộn!**`
  });
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;