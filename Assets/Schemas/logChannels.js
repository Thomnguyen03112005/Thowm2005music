const mongoose = require("mongoose");

const database = new mongoose.Schema({
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

module.exports = mongoose.model("logChannels", database);