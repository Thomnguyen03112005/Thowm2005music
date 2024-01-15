const config = require(`${process.cwd()}/config.json`);
const mongoose = require("mongoose");
/*========================================================
# Economy.js ✔️
========================================================*/
const __currency = new mongoose.Schema({
  userID: String,
  guildID: String,
  inventory: Array,
  wallet: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
  networth: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: new Date() },
  lastGamble: { type: Number, default: 0 },
  lastHourly: { type: Number, default: 0 },
  lastQuaterly: { type: Number, default: 0 },
  lastHafly: { type: Number, default: 0 },
  lastRob: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  lastWeekly: { type: Number, default: 0 },
  lastMonthly: { type: Number, default: 0 },
  lastYearly: { type: Number, default: 0 },
  lastBegged: { type: Number, default: 0 },
  lastWork: { type: Number, default: 0 },
  bankSpace: { type: Number, default: 0 },
  begTimeout: { type: Number, default: 240 },
  streak: {
    hourly: { type: Number, default: 1 },
    daily: { type: Number, default: 1 },
    weekly: { type: Number, default: 1 },
    monthly: { type: Number, default: 1 },
    yearly: { type: Number, default: 1 },
    hafly: { type: Number, default: 1 },
    quaterly: { type: Number, default: 1 },
  }
});
const __inventory = new mongoose.Schema({
  guildID: { type: String, default: null },
  inventory: { type: Array },
  lastUpdated: { type: Date, default: new Date() },
});
/*========================================================
# Playlist.js ✔️
========================================================*/
const __playlist = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  userId: mongoose.SchemaTypes.String,
  name: mongoose.SchemaTypes.String,
  songs: {
    url: mongoose.SchemaTypes.Array,
    name: mongoose.SchemaTypes.Array
  },
  privacy: Boolean,
});
/*========================================================
# Music 
========================================================*/
const __music = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  GuildName: mongoose.SchemaTypes.String,
  DefaultAutoresume: {
    type: mongoose.SchemaTypes.Boolean,
    default: true
  },
  DefaultAutoplay: {
    type: mongoose.SchemaTypes.Boolean,
    default: false
  },
  DefaultVolume: {
    type: mongoose.SchemaTypes.Number,
    default: 50
  },
  DefaultFilters: {
    type: mongoose.SchemaTypes.Array,
    default: ['bassboost']
  },
  MessageId: mongoose.SchemaTypes.String,
  ChannelId: mongoose.SchemaTypes.String,
  Djroles: mongoose.SchemaTypes.Array
});
/*========================================================
# WelcomeGoodbye.js
========================================================*/
const __welcomeGoodbye = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.String,
  GuildName: mongoose.SchemaTypes.String,
  WelcomeChannel: mongoose.SchemaTypes.String,
  GoodbyeChannel: mongoose.SchemaTypes.String,
  AutoAddRoleWel: mongoose.SchemaTypes.Array,
});
/*========================================================
# Prefix
========================================================*/
const __prefix = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  GuildName: mongoose.SchemaTypes.String,
  Prefix: {
    type: mongoose.SchemaTypes.String,
    default: config.prefix
  }
});
/*========================================================
# logChannels
========================================================*/
const __logChannels = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.Number,
  GuildName: mongoose.SchemaTypes.String,
  // create voice
  ChannelAutoCreateVoice: mongoose.SchemaTypes.String,
  // voice
  voiceStateUpdate: mongoose.SchemaTypes.String,
  // channel
  channelCreate: mongoose.SchemaTypes.String,
  channelDelete: mongoose.SchemaTypes.String,
  channelUpdate: mongoose.SchemaTypes.String,
  // Guild
  guildMemberUpdate: mongoose.SchemaTypes.String,
  guildCreate: mongoose.SchemaTypes.String,
  guildDelete: mongoose.SchemaTypes.String,
  guildUpdate: mongoose.SchemaTypes.String
});
/*========================================================
# afkSchema
========================================================*/
const __afkSchema = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.String,
  UserId: mongoose.SchemaTypes.String,
  Message: mongoose.SchemaTypes.String,
  Nickname: mongoose.SchemaTypes.String
});
/*========================================================
#  Giveaways
========================================================*/
const __giveawayModel = new mongoose.Schema({
  messageId: String,
  channelId: String,
  guildId: String,
  startAt: Number,
  endAt: Number,
  ended: Boolean,
  winnerCount: Number,
  prize: String,
  messages: {
    giveaway: String,
    giveawayEnded: String,
    title: String,
    inviteToParticipate: String,
    drawing: String,
    dropMessage: String,
    winMessage: mongoose.Mixed,
    embedFooter: mongoose.Mixed,
    noWinner: String,
    winners: String,
    endedAt: String,
    hostedBy: String
  },
  thumbnail: String,
  image: String,
  hostedBy: String,
  winnerIds: { type: [String], default: undefined },
  reaction: mongoose.Mixed,
  botsCanWin: Boolean,
  embedColor: mongoose.Mixed,
  embedColorEnd: mongoose.Mixed,
  exemptPermissions: { type: [], default: undefined },
  exemptMembers: String,
  bonusEntries: String,
  extraData: mongoose.Mixed,
  lastChance: {
    enabled: Boolean,
    content: String,
    threshold: Number,
    embedColor: mongoose.Mixed
  },
  pauseOptions: {
    isPaused: Boolean,
    content: String,
    unPauseAfter: Number,
    embedColor: mongoose.Mixed,
    durationAfterPause: Number,
    infiniteDurationText: String
  },
  isDrop: Boolean,
  allowedMentions: {
    parse: { type: [String], default: undefined },
    users: { type: [String], default: undefined },
    roles: { type: [String], default: undefined }
  }
}, { id: false });
/*========================================================
# autoresume
========================================================*/
const __autoresume = new mongoose.Schema({
  GuildId: mongoose.SchemaTypes.String,
  voiceChannel: mongoose.SchemaTypes.String,
  currentTime: mongoose.SchemaTypes.Number,
  repeatMode: mongoose.SchemaTypes.Number,
  autoplay: mongoose.SchemaTypes.Boolean,
  playing: mongoose.SchemaTypes.Boolean,
  filters: mongoose.SchemaTypes.Array,
  songs: mongoose.SchemaTypes.Array,
});
module.exports = {
  Currency: mongoose.model('currency', __currency),
  Inventory: mongoose.model('Inventory', __inventory),
  Playlist: mongoose.model("playlist", __playlist),
  Music: mongoose.model("musicData", __music),
  welcomeGoodbye: mongoose.model("welcomeGoodbye", __welcomeGoodbye),
  Prefix: mongoose.model("prefix", __prefix),
  // logChannels:  mongoose.model("logChannels", __logChannels),
  afkSchema: mongoose.model('afk', __afkSchema),
  giveawayModel: mongoose.model('giveaways', __giveawayModel),
  autoresume: mongoose.model('autoresume', __autoresume),
};