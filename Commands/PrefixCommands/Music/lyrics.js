const { EmbedBuilder } = require("discord.js");
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: [], // lệnh phụ
  description: "Xem lời bài hát đang phát", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand(async(client, message, args, prefix) => {
  const VoiceChannel = message.member.voice.channel;
    if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
    let newQueue = client.distube.getQueue(message.guildId);
		if(!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
			embeds: [new EmbedBuilder().setColor("Random").setTitle("Danh sách nhạc trống")],
	  });
    const lyricsfinder = require('lyrics-finder');
    try {
        const queue = await client.distube.getQueue(guildId);
        let name = queue.songs.map((song) => song.name).slice(0, 1).join("\n");
        let uploader = queue.songs.map((song) => song.uploader.name).slice(0, 1).join("\n");
        let thumbnail = queue.songs.map((song) => song.thumbnail).slice(0, 1).join("\n");
        let url = queue.songs.map((song) => song.url).slice(0, 1).join("\n");
        let lyrics = (await lyricsfinder(uploader, name)) || "Không tìm thấy lời bài hát!";
        message.reply({ embeds: [new EmbedBuilder()
          .setAuthor({ name: name, iconURL: thumbnail, url: url })
          .setColor("Random")
          .setThumbnail(thumbnail)
          .setDescription(lyrics),
        ]});
    } catch(e) {
      console.log(e);
    };
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;                     