const { EmbedBuilder, StringSelectMenuBuilder, parseEmoji, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType, Collection, SelectMenuBuilder } = require("discord.js");
const fetch = require("node-fetch");
// function
const { slashCommandBuilder, commandBuilders } = require("./Functions/commands");
const { RPSGame, Slots } = require("./Functions/Game");
const embedCreator = require("./Functions/embedCreator");
const classComponent = require("./Functions/components");
const customEvents = require("./Functions/discord");
// config
const config = require(`${process.cwd()}/config.json`); 
// tạo thời gian hồi lệnh
const onCoolDown = (cooldowns, message, commands) => {
  if (!message || !commands) return;
  let { member } = message;
  if(!cooldowns.has(commands.name)) {
    cooldowns.set(commands.name, new Collection());
  };
  const now = Date.now();
  const timestamps = cooldowns.get(commands.name);
  const cooldownAmount = commands.cooldown * 1000;
  if(timestamps.has(member.id)) {
    const expirationTime = timestamps.get(member.id) + cooldownAmount;
    if(now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000; //có được thời gian còn lại
      return timeLeft;
    } else {
      timestamps.set(member.id, now);
      setTimeout(() => timestamps.delete(member.id), cooldownAmount);
      return false;
    };
  } else {
    timestamps.set(member.id, now);
    setTimeout(() => timestamps.delete(member.id), cooldownAmount);
    return false;
  };
};
// Music embed
const musicEmbedDefault = (client, guilds) => {
    const guild = client.guilds.cache.get(guilds.id);
    const genshinGif = [
      "https://upload-os-bbs.hoyolab.com/upload/2021/08/12/64359086/ad5f51c6a4f16adb0137cbe1e86e165d_8637324071058858884.gif?x-oss-process=image/resize,s_1000/quality,q_80/auto-orient,0/interlace,1/format,gif",
    ];
    const randomGenshin = genshinGif[Math.floor(Math.random() * genshinGif.length)];
    var playlistName = [`Gaming`, `NCS | No Copyright Music`];
    var Emojis = [`0️⃣`, `1️⃣`];
    const { EmbedBuilders, addComponents } = customEvents();
    return {
      embeds: [
        new EmbedBuilders({
          description: `**Hiện tại có __0 Bài hát__ trong Hàng đợi**`,
          title: { name: `📃 hàng đợi của __${guild.name}__` },
          thumbnail: guild.iconURL({ dynamic: true }),
          colors: "Random",
        }),
        new EmbedBuilders({
          title: { name: `Bắt đầu nghe nhạc, bằng cách kết nối với Kênh voice và gửi **LIÊN KẾT BÀI HÁT** hoặc **TÊN BÀI HÁT** trong Kênh này!` },
          description: `> *Tôi hỗ trợ Youtube, Spotify, Soundcloud và các liên kết MP3 trực tiếp!*`,
          footer: { text: guild.name, iconURL: guild.iconURL({ dynamic: true }) },
          images: randomGenshin,
          colors: "Random"
        })
      ], 
      components: addComponents({
        type: "SelectMenuBuilder",
        options: {
          placeholder: "Vui lòng lựa chọn mục theo yêu cầu",
          customId: "StringSelectMenuBuilder",
          // minValues: 1, maxValues: 2,
          options: [playlistName.map((t, index) => {
            return { 
              label: t.substr(0, 25), // trích xuất từ 0 đến 25 từ 
              value: t.substr(0, 25), // trích xuất từ 0 đến 25 từ
              description: `Tải Danh sách phát nhạc: '${t}'`.substr(0, 50),  // trích xuất từ 0 đến 50 từ
              emoji: Emojis[index], // thêm emoji cho từng cụm từ 
              default: false // lựa chọn mặc định
            };
          })]
        }
      }, {
        type: "ButtonBuilder",
        options: [
          { style: "Primary", customId: "1", emoji: "⏭", label: "Skip", disabled: true },
          { style: "Danger", customId: "2", emoji: "🏠", label: "Stop", disabled: true },
          { style: "Secondary", customId: "3", emoji: "⏸", label: "Pause", disabled: true },
          { style: "Success", customId: "4", emoji: "🔁", label: "Autoplay", disabled: true },
          { style: "Primary", customId: "5", emoji: "🔀", label: "Shuffle", disabled: true },
        ]
      }, {
        type: "ButtonBuilder",
        options: [
          { style: "Success", customId: "6", emoji: "🔁", label: "Song", disabled: true },
          { style: "Success", customId: "7", emoji: "🔂", label: "Queue", disabled: true },
          { style: "Primary", customId: "8", emoji: "⏩", label: "+10 Sec", disabled: true },
          { style: "Primary", customId: "9", emoji: "⏪", label: "-10 Sec", disabled: true },
          { style: "Primary", customId: "10", emoji: "📝", label: "Lyrics", disabled: true },
        ]
      })
    };
};
// MusicRole
const MusicRole = (client, member, song) => {
    if(!client) return false; // nếu không có tin nhắn được thêm trở lại 
    const { Music } = require(`${process.cwd()}/Assets/Schemas/database`);
    var roleid = Music.findOne({ GuildId: member.guild.id }); // lấy quyền quản trị
    if(String(roleid) == "") return false; // nếu không có musicrole trả về false, để nó tiếp tục
    var isdj = false; // định nghĩa các biến
    for (let i = 0; i < roleid.length; i++) { // lặp qua các roles
        if(!member.guild.roles.cache.get(roleid[i])) continue; // nếu roles không tồn tại, hãy bỏ qua vòng lặp hiện tại này
        if (member.roles.cache.has(roleid[i])) isdj = true; // nếu anh ấy có vai trò được đặt var thành true
        // thêm roles vào chuỗi
    }
    // nếu không có dj và không phải là quản trị viên, hãy trả về chuỗi
    if (!isdj && !member.permissions.has("Administrator") && song.user.id != member.id) {
        if(!roleid) return;
        return roleid.map((i) => `<@&${i}>`).join(", ");
    // nếu anh ta là dj hoặc quản trị viên, thì hãy trả về false, điều này sẽ tiếp tục cmd
    } else {
        return false;
    };
};
/*========================================================
# baseURL
========================================================*/
const baseURL = async(url, options) => {
  const response = options ? await fetch(url, options) : await fetch(url);
  const json = await response.json();
  return {
    success: response.status === 200 ? true : false,
    status: response.status,
    data: json,
  };
};
/*========================================================
# Economy
========================================================*/
const CurrencySystem = require("currency-system");

const EconomyHandler = class extends CurrencySystem {
  constructor(client, options) {
    super();
    this.client = client;
    this.setDefaultWalletAmount(options.setDefaultWalletAmount || 1000);
    this.setDefaultBankAmount(options.setDefaultBankAmount || 1000);
    this.setMaxWalletAmount(options.setMaxWalletAmount || 0);
    this.setMaxBankAmount(options.setMaxBankAmount || 0);
    this.setMongoURL(options.setMongoURL);
    // hiển thị nếu có phiêm bản mới
    this.searchForNewUpdate(options.searchForNewUpdate || true);
    // thiết lập tiền tệ của các nước.
    this.formats = options.setFormat; 
    this.__init();
  };
  // Phân loại tiền theo các nước
  formatter(money) {
    const c = new Intl.NumberFormat(this.formats[0], {
      style: 'currency',
      currency: this.formats[1],
    });
    return c.format(money);
  };
  // chạy emitting
  __init() {
    CurrencySystem.cs.on("debug", (debug, error) => {
      // console.log(debug);
      if(error) console.error(error);
    });
    CurrencySystem.cs.on("userFetch", (user, functionName) => {
      console.log(`(${functionName}) Đã tìm nạp người dùng:  ${this.client.users.cache.get(user.userID).tag}`.blue);
    });
    CurrencySystem.cs.on("userUpdate", (oldData, newData) => {
      console.log("Người dùng đã cập nhật: ".green + `${this.client.users.cache.get(newData.userID).tag}`.yellow);
    });
  };
};

module.exports = {
  commandBuilders,
  embedCreator,
  slashCommandBuilder,
  customEvents,
  onCoolDown, 
  baseURL, 
  MusicRole,
  musicEmbedDefault,
  EconomyHandler,
  classComponent,
  RPSGame, Slots
};