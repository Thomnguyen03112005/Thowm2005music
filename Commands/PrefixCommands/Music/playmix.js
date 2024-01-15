const { EmbedBuilder } = require("discord.js");
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: [], // lệnh phụ
  description: "Phát bài hát theo playlist có sẵn", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand(async(client, message, args, prefix) => {
    const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    let link = "https://open.spotify.com/playlist/2kLGCKLDSXu7d2VvApmiWg";
    if(args[0]) {
      if(args[0].toLowerCase().startsWith("lofi")) {
        link = "https://open.spotify.com/playlist/2kLGCKLDSXu7d2VvApmiWg";
      } else if(args[0].toLowerCase().startsWith("thattinh")) {
        link = "https://open.spotify.com/playlist/4Aj61H8LI3OdtHLwEf5wo5";
      } else if(args[0].toLowerCase().startsWith("reallove")) {
        link = "https://open.spotify.com/playlist/7yQiYrVwwV8TgGa1FwhCUl";
      } else if(args[0].toLowerCase().startsWith("gaming")) {
        link = "https://open.spotify.com/playlist/5ravtOAghdGsfYeKhFx0xU";
      };
    };
    let newMsg = await message.reply({
			content: `Đang tải **'${args[0] ? args[0] : "Mặc định"}'**`,
		});
    let queue = client.distube.getQueue(message.guildId);
		await client.distube.play(VoiceChannel, link, {
      textChannel: message.channel,
      member: message.member
    });
    newMsg.edit({ content: `${queue?.songs?.length > 0 ? "👍 Đã thêm" : "🎶 Đang phát"}: **'${args[0] ? args[0] : "Mặc định"}'**` });
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;