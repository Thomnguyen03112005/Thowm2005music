const { Client: DiscordClient, GatewayIntentBits, Partials, Collection, Routes, REST } = require("discord.js");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { DisTube } = require("distube");
const ascii = require("ascii-table");
const mongoose = require("mongoose");
const fs = require("node:fs");
require('events').defaultMaxListeners = 100;
require("libsodium-wrappers");
require("ffmpeg-static");
require("colors");
// yêu cầu các files
const { EconomyHandler } = require(`${process.cwd()}/Events/functions`);
const config = require(`${process.cwd()}/config.json`);
/*========================================================
# DiscordClient Events
========================================================*/
const Client = class extends DiscordClient {
  constructor(options) {
    super({
      messageCacheLifetime: 60,
      messageCacheMaxSize: 10,
      fetchAllMembers: false,
      restTimeOffset: 0,
      restWsBridgetimeout: 100,
      shards: "auto",
      failIfNotExists: false,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      partials: [Partials.User, Partials.Message, Partials.Reaction], //Object.keys(Partials), // get tất cả sự kiện mà partials có điều này có thể gây delay cho bot của bạn
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
      ], //Object.keys(GatewayIntentBits), // get tất cả sự kiện mà GatewayIntentBits có điều này có thể gây delay cho bot của bạn
    });
    /*================================================================================================================*/
    this.mongo = options.setMongoURL; // lấy đường link mongourl của bạn
    this.token = options.setToken; // lấy thông báo discord bot 
    /*================================================================================================================*/
    this._init();
    this._launchEvent();
    this._connectMongoodb();
    this.setMaxListeners(100);
  };
  /*================================================================================================================*/
  _init() {
    this.maps = new Map();
    this.aliases = new Collection();
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.slashCommands = new Collection();
    // Hệ thống tiền tệ
    this.cs = new EconomyHandler(this, {
      setFormat: ["vi-VN", "VND"], // xác định loại tiền của các nước
      // Đặt số tiền ngân hàng mặc định khi người dùng mới được tạo!
      setDefaultWalletAmount: 10000, // trong ví tiền
      setDefaultBankAmount: 10000, // trong ngân hàng
      setMaxWalletAmount: 0, // Đặt số lượng tiền trong ví tiền tối đa mặc định mà người dùng có thể có! ở đây 0 có nghĩa là vô hạn.
      setMaxBankAmount: 0, // Giới hạn dung lượng ngân hàng của nó ở đây 0 có nghĩa là vô hạn.
      setMongoURL: this.mongo,
      searchForNewUpdate: true, // kiểm tra thông báo phiên bản mới
    });
    /*========================================================
    # Distube Events
    ========================================================*/
    const spotifyPlugin = new SpotifyPlugin({
      parallel: true, // Mặc định là true. Có hoặc không tìm kiếm danh sách phát song song.
      emitEventsAfterFetching: true, // Mặc định là false. Phát addList và playSong sự kiện trước hoặc sau khi tìm nạp tất cả các bài hát.
      api: {
        clientId: config.clientId, // Client ID của ứng dụng Spotify của bạn (Tùy chọn - Được sử dụng khi plugin không thể tự động lấy thông tin đăng nhập)
        clientSecret: config.clientSecret, // Client Secret của ứng dụng Spotify của bạn (Tùy chọn - Được sử dụng khi plugin không thể tự động lấy thông tin đăng nhập)
        topTracksCountry: "US", // Mã quốc gia của các bản nhạc của nghệ sĩ hàng đầu (mã quốc gia ISO 3166-1 alpha-2). Mặc định là US.
      }
    });
    const ytDlpPlugin = new YtDlpPlugin({
      update: true // Mặc định là true. Cập nhật tệp nhị phân yt-dlp khi plugin được khởi chạy.
    });
    const soundCloudPlugin = new SoundCloudPlugin(/*{
      clientId : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Id khách hàng của tài khoản của bạn.
      oauthToken : "0-000000-000000000-xxxxxxxxxxxxxx", // Mã thông báo oauth của tài khoản của bạn. Được sử dụng để tìm nạp thêm dữ liệu bằng tài khoản SoundCloud Go+.
    }*/);
    // Distube - bảng điều khiển nhạc nhẽo các thứ
    this.distube = new DisTube(this, {
      searchSongs: 0,
      searchCooldown: 30,
      leaveOnEmpty: true,
      emptyCooldown: 25,
      savePreviousSongs: true,
      leaveOnFinish: false,
      leaveOnStop: true,
      nsfw: true,
      plugins: [spotifyPlugin, ytDlpPlugin, soundCloudPlugin],
      youtubeCookie: config.youtubeCookie,
      ytdlOptions: {
        highWaterMark: 1024 * 1024 * 64,
        quality: "highestaudio",
        format: "audioonly",
        liveBuffer: 60000,
        dlChunkSize: 1024 * 1024 * 4,
        youtubeCookie: config.youtubeCookie,
      },
      emitAddListWhenCreatingQueue: false,
      emitAddSongWhenCreatingQueue: false,
      emitNewSongOnly: true,
    });
  };
  /*================================================================================================================*/
  _launchEvent() {
    return this.login(this.token).then(() => {
      this.executeEvents(require("./events"));
      this.commandHandler({
        setCommandPath: `${process.cwd()}/Commands/PrefixCommands/`
      });
      this.slashHandlers({
        setSlashCommandPath: `${process.cwd()}/Commands/SlashCommands/`
      });
    }).catch((e) => console.warn(e));
  };
  /*================================================================================================================*/
  _connectMongoodb() {
    if (!this.mongo) {
      console.warn("[WARN] URI/URL Mongo không được cung cấp! (Không yêu cầu)".red);
    } else {
      mongoose.connect(this.mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log("Đã kết nối đến mongoodb".blue);
      }).catch((err) => console.log(err));
      mongoose.set("strictQuery", false);
      mongoose.set('debug', false);
    };
  };
  /*================================================================================================================*/
  executeEvents(events) {
    let __E = new ascii("Events - Create").setHeading("Tên Events", "Trạng thái");
    for (let elements of events.values()) {
      if (elements.eventOnce) {
        this.once(elements.eventName, (...args) => elements.executeEvents(this, ...args));
      } else {
        this.on(elements.eventName, (...args) => elements.executeEvents(this, ...args));
      };
      if (elements.eventName) {
        __E.addRow(elements.eventCustomName, '✔');
      } else {
        __E.addRow(elements.eventCustomName, '❌');
      };
    };
    console.log(__E.toString().blue);
  };
  /*================================================================================================================*/
  commandHandler(options) {
    let tableCmds = new ascii('BlackCat - commands');
    tableCmds.setHeading("Tên Lệnh", "Trạng thái");
    const commandsPath = options.setCommandPath;
    fs.readdirSync(commandsPath).forEach((dir) => {
      const commands = fs.readdirSync(`${commandsPath}/${dir}/`).filter(file => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`${commandsPath}/${dir}/${file}`);
        if (pull.name) {
          this.commands.set(pull.name, pull);
          tableCmds.addRow(file, '✔');
        } else {
          tableCmds.addRow(file, "❌");
          continue;
        };
        if (pull.aliases && Array.isArray(pull.aliases)) {
          pull.aliases.forEach(alias => this.aliases.set(alias, pull.name));
        };
      };
    });
    console.log(tableCmds.toString().magenta);
  };
  /*================================================================================================================*/
  slashHandlers(options) {
    const SlashCmds = new ascii("BlackCat - Slash");
    SlashCmds.setHeading("Tên lệnh", "Trạng thái");
    const slashCommandsPath = options.setSlashCommandPath;
    const data = [];
    fs.readdirSync(slashCommandsPath).forEach((dir) => {
      const slashCommandFile = fs.readdirSync(`${slashCommandsPath}/${dir}/`).filter((files) => files.endsWith(".js"));
      for (const file of slashCommandFile) {
        const slashCommand = require(`${slashCommandsPath}/${dir}/${file}`);
        this.slashCommands.set(slashCommand.name, slashCommand);
        if (slashCommand.name) {
          SlashCmds.addRow(file.split('.js')[0], '✔')
        } else {
          SlashCmds.addRow(file.split('.js')[0], '❌')
        };
        if (!slashCommand.name) return console.log("Thiếu tên lệnh".red);
        if (!slashCommand.description) return console.log("Thiếu mô tả lệnh".red);
        data.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
        });
      };
    });
    const rest = new REST({ version: "10" }).setToken(this.token);
    this.on("ready", () => (async() => {
      try {
        await rest.put(Routes.applicationCommands(this.user.id), {
          body: data
        });
        console.log("Các lệnh (/) đã sẵn sàng".yellow);
      } catch (err) {
        console.log(err);
      };
    })());
    console.log(SlashCmds.toString().blue);
  };
};

module.exports = Client;