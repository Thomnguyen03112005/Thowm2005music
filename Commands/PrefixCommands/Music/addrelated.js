const { EmbedBuilder } = require("discord.js");
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
}).addCommand(async (client, message, args, prefix) => {
	const VoiceChannel = message.member.voice.channel;
	if (!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
	let newQueue = client.distube.getQueue(message.guildId);
	if (!newQueue || !newQueue.songs || newQueue.songs.length == 0) return message.reply({
		embeds: [new EmbedBuilder().setColor("Random").setTitle("Danh sách nhạc trống")],
	});
	let thenewmsg = await message.reply({
		content: `🔍 Tìm kiếm bài hát liên quan cho... **${newQueue.songs[0].name}**`,
	}).catch((e) => {
		console.log(e);
	});
	await newQueue.addRelatedSong();
	await thenewmsg.edit({
		content: `👍 Đã thêm: **${newQueue.songs[newQueue.songs.length - 1].name}**`,
	}).catch((e) => {
		console.log(e);
	});
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;  