const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const path = require("node:path");


const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: ["np"], // lệnh phụ
  description: "Xem bài hát hiện tại đang phát", // mô tả dành cho lệnh
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
    /*
    const Canvas = require('canvas');
    let queuesong = newQueue.formattedCurrentTime;
    let cursong = newQueue.songs[0];
    let cursongtimes = 0;
    let cursongtimem = 0;
    let cursongtimeh = 0;
    let queuetimes = 0;
    let queuetimem = 0;
    let queuetimeh = 0;
    if(cursong.formattedDuration.split(":").length === 3) {
      cursongtimes = cursong.formattedDuration.split(":")[2]
      cursongtimem = cursong.formattedDuration.split(":")[1]
      cursongtimeh = cursong.formattedDuration.split(":")[0]
    };
    if(queuesong.split(":").length === 3) {
      queuetimes = queuesong.split(":")[2]
      queuetimem = queuesong.split(":")[1]
      queuetimeh = queuesong.split(":")[0]
    };
    cursongtimes = cursong.formattedDuration.split(":")[1]
    cursongtimem = cursong.formattedDuration.split(":")[0]
    queuetimes = queuesong.split(":")[1]
    queuetimem = queuesong.split(":")[0]
    let maxduration = Number(cursongtimes) + Number(cursongtimem) * 60 + Number(cursongtimeh) * 60 * 60;
    let minduration = Number(queuetimes) + Number(queuetimem) * 60 + Number(queuetimeh) * 60 * 60;
    let percentduration = Math.floor((minduration / maxduration) * 100);
    let songtitle = cursong.name;
    let oftime = `${newQueue.formattedCurrentTime}/${cursong.formattedDuration}`
    const canvas = Canvas.createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1092880002695036950/1103677516016787517/bg.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    const url = `https://img.youtube.com/vi/${cursong.id}/mqdefault.jpg`
    const avatar = await Canvas.loadImage(url);
    ctx.drawImage(avatar, 10, 10, 192, 108);
    var textString = songtitle.substr(0, 35);
    ctx.font = 'bold 40px Genta';
    ctx.fillStyle = '#d625ed';
    ctx.fillText(textString, 10 + 192 + 10, 10 + 25);
    let textStringt
    if (songtitle.length > 40) textStringt = songtitle.substr(35, 32) + "...";
    else textStringt = "";
    ctx.font = 'bold 40px Genta';
    ctx.fillStyle = '#d625ed';
    ctx.fillText(textStringt, 10 + 192 + 10, 10 + 25 + 40);
    ctx.font = 'bold 30px Genta';
    ctx.fillStyle = '#d625ed';
    ctx.fillText(oftime, 10 + 192 + 10, 10 + 25 + 30 + 50);
    let percent = percentduration;
    let index = Math.floor(percent) || 10;
    let left = Number(".".repeat(index).length) * 7.9;
    if (left < 50) left = 50;
    let x = 14;
    let y = 200 - 65;
    let width = left;
    let height = 50;
    let radius = 25;
    if(width < 2 * radius) radius = width / 2;
    if(height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fillStyle = '#d625ed';
    ctx.fill();
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: 'nowplaying.png' 
    });
    */
    return await message.reply({ 
      content: "Chờ sửa lỗi :)))"
      // files: [attachment]
    });
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;