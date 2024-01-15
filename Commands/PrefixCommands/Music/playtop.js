const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: [], // lệnh phụ
  description: "Phát Bài hát/Danh sách phát và thêm nó vào Đầu", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand(async(client, message, args, prefix) => {
  const VoiceChannel = message.member.voice.channel;
  if(!VoiceChannel) return message.reply({ content: "Bạn chưa tham gia kênh voice" });
  let newQueue = client.distube.getQueue(message.guildId);
  if(!args[0]) return message.reply({
    content: "Vui lòng nhập tên bài hát hoặc url bài hát"
  });
  const { MusicRole } = require(`${process.cwd()}/Events/functions`);
  if(MusicRole(client, message.member, newQueue.songs[0])) return message.reply({
    content: ` Bạn Không có MusicRole hoặc bạn không phải người yêu cầu bài hát\n(${MusicRole(client, message.member, newQueue.songs[0])})`
  });
  const Text = args.join(" "); 
  let newmsg = await message.reply({
    content: `🔍 Đang tìm kiếm... \`\`\`${Text}\`\`\``,
  }).catch(e => console.log(e));
  await client.distube.play(VoiceChannel, Text, {
    member: message.member,
    unshift: true
  });
  newmsg.edit({
    content: `${queue?.songs?.length > 0 ? "👍 Đã thêm vào đầu hàng đợi" : "🎶 Đang phát"}: \`\`\`css\n${Text}\n\`\`\``,
  }).catch(e => console.log(e));
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;