const { ActivityType, EmbedBuilder, PermissionsBitField, InteractionType, ChannelType, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits, Collection, ComponentType, TextInputStyle, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { Prefix: prefixSchema, welcomeGoodbye: database, Music: PlayMusicData, afkSchema } = require(`${process.cwd()}/Assets/Schemas/database`);
const { onCoolDown, } = require(`${process.cwd()}/Events/functions`);
const channelSchema = require(`${process.cwd()}/Assets/Schemas/logChannels.js`);
const config = require(`${process.cwd()}/config.json`);
const eventBuilders = require("./Functions/events");
/*========================================================
# create Schema
========================================================*/
const createSchemas = new eventBuilders({
  eventCustomName: "createSchema.js",
  eventName: "ready",
  eventOnce: false,
  executeEvents: async (client) => {
    client.guilds.cache.forEach(async (guild) => {
      const findChannel = await channelSchema.findOne({
        GuildId: guild.id,
      });
      if (!findChannel) return channelSchema.create({
        GuildName: guild.name,
        GuildId: guild.id
      });
    });
    client.guilds.cache.forEach(async (guild) => {
      const Weldata = await database.findOne({
        GuildId: guild.id
      });
      if (!Weldata) return database.create({
        GuildName: guild.name,
        GuildId: guild.id
      });
    });
    client.guilds.cache.forEach(async (guild) => {
      const musicData = await PlayMusicData.findOne({
        GuildId: guild.id
      });
      if (!musicData) return PlayMusicData.create({
        GuildName: guild.name,
        GuildId: guild.id
      });
    });
  },
});
/*========================================================
# Ready.js
========================================================*/
const ready = new eventBuilders({
  eventCustomName: "ready.js",
  eventName: "ready",
  eventOnce: false,
  executeEvents: async (client) => {
    /*========================================================
    # Xem bot đã online hay chưa
    ========================================================*/
    console.log(`${client.user.username} đã sẵn sàng hoạt động`.red);
    const setActivities = [
      `${client.guilds.cache.size} Guilds, ${client.guilds.cache.map(c => c.memberCount).filter(v => typeof v === "number").reduce((a, b) => a + b, 0)} member`,
      `BlackCat-Club`,
      `${config.prefix}help`
    ];
    setInterval(() => {
      client.user.setPresence({
        activities: [{ name: setActivities[Math.floor(Math.random() * setActivities.length)], type: ActivityType.Playing }],
        status: 'dnd',
      });
    }, 5000);
  },
});
/*========================================================
# messageCreate.js
========================================================*/
const messageCreate = new eventBuilders({
  eventCustomName: "messageCreate.js", // Tên sự kiện tùy chọn
  eventName: "messageCreate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, message) => {
    if (message.author.bot || !message.guild) return;
    const prefixDT = await prefixSchema.findOne({ GuildId: message.guild.id });
    if (!prefixDT) {
      const newPrefix = new prefixSchema({
        GuildId: message.guild.id,
      });
      await newPrefix.save().catch((e) => {
        console.log("Lỗi:", e);
      });
    };
    const prefix = prefixDT ? prefixDT.Prefix : config.prefix;
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);
    if (!message.content.startsWith(matchedPrefix)) return;
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) return message.reply({
      embeds: [new EmbedBuilder().setDescription("Prefix của tôi là:" + ` \`${prefix}\``)]
    });
    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
      try {
        const embed = new EmbedBuilder().setTitle("Thiếu quyền").setColor("Random")
        if (command.permissions) {
          if (!message.member.permissions.has(PermissionsBitField.resolve(command.permissions || []))) return message.reply({
            embeds: [embed.setDescription(`Bạn không có quyền ${command.permissions} để sử dụng lệnh này`)],
          });
        };
        if (onCoolDown(client.cooldowns, message, command)) return message.reply({
          content: `❌ Bạn đã sử dụng lệnh quá nhanh vui lòng đợi ${onCoolDown(client.cooldowns, message, command).toFixed()} giây trước khi sử dụng lại \`${command.name}\``
        });
        if (command.owner && message.author.id !== config.developer) return message.reply({
          embeds: [embed.setDescription(`Bạn không thể sử dụng lệnh này chỉ có <@${config.developer}> mới có thể sử dụng`)]
        });
        if (command.command) {
          command.command(client, message, args, prefix);
        } else {
          command.run(client, message, args, prefix);
        };
      } catch (error) {
        console.log(error.toString());
        message.reply({ content: "Lỗi đã được gởi đi :))" });
      };
    } else return message.reply({ content: `Sai lệnh. nhập ${prefix}help để xem lại tất cả các lệnh` }).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  },
});
/*========================================================
# interactionCreate.js
========================================================*/
const interactionCreate = new eventBuilders({
  eventCustomName: "interactionCreate.js", // Tên sự kiện tùy chọn
  eventName: "interactionCreate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, interaction) => {
    if (interaction.type === InteractionType.ApplicationCommand) {
      if (!client.slashCommands.has(interaction.commandName) || !interaction.guild) return;
      const SlashCommands = client.slashCommands.get(interaction.commandName);
      if (!SlashCommands) return;
      if (SlashCommands) {
        try {
          const embed = new EmbedBuilder().setTitle("Thiếu quyền sử dụng lệnh").setColor("Random");
          // dev commands
          if (SlashCommands.owner && config.developer.includes(interaction.user.id)) return interaction.reply({
            content: "Tôi, không phải là bot ngu ngốc, chỉ chủ sở hữu mới có thể sử dụng lệnh này"
          });
          // Các quyền của thành viên
          if (SlashCommands.userPerms) {
            if (!interaction.member.permissions.has(PermissionsBitField.resolve(SlashCommands.userPerms || []))) return interaction.reply({
              embeds: [embed.setDescription(`Xin lỗi, bạn không có quyền ${SlashCommands.userPerms} trong <#${interaction.channelId}> để sử dụng lệnh ${SlashCommands.name} này`)]
            });
          };
          SlashCommands.run(client, interaction);
        } catch (error) {
          if (interaction.replied) return await interaction.editReplyinteraction.editReply({
            embeds: [new EmbedBuilder().setDescription("Đã xảy ra lỗi khi thực hiện lệnh, xin lỗi vì sự bất tiện <3")],
            ephemeral: true,
          }).catch(() => { });
          console.log(error);
        };
      };
    };
  },
});
/*========================================================
# guildCreate.js // send messsage 
========================================================*/
const sendMessage = new eventBuilders({
  eventCustomName: "sendMessage", // Tên events tùy chỉnh
  eventName: "guildCreate", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client, guild) => {
    const guilds = await guild.channels.cache.find((channels) => channels.type === ChannelType.GuildText && channels.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite && PermissionFlagsBits.SendMessages));
    guilds.send({
      embeds: [new EmbedBuilder()
        .setAuthor({ name: guild.name, url: "https://discord.gg/tSTY36dPWa" })
        .setThumbnail("https://i.pinimg.com/originals/3f/2c/10/3f2c1007b4c8d3de7d4ea81b61008ca1.gif")
        .setColor("Random")
        .setTimestamp()
        .setDescription(`✨ ${config.prefix}help để xem tất cả các lệnh`)
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      ], components: [new ActionRowBuilder().addComponents([
        new ButtonBuilder().setCustomId('inviteBot').setLabel('Mời bot').setStyle("Primary").setEmoji('🗿'),
        new ButtonBuilder().setCustomId('inviteDiscord').setLabel('Vào Discord').setStyle("Primary").setEmoji('🏡')
      ])]
    }).catch((e) => console.log(`guildCreate: ${e}`));
  },
});
/*========================================================
# guildCreate.js
========================================================*/
const guildCreate = new eventBuilders({
  eventCustomName: "guildCreate.js", // Tên sự kiện tùy chọn
  eventName: "guildCreate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, guild) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
    // Tin nhắn gửi đến channel mà bot có thể gửi. :)) 
    const guilds = await guild.channels.cache.find((channels) => channels.type === ChannelType.GuildText && channels.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite && PermissionFlagsBits.SendMessages));
    // gởi tin nhắn vào kênh nhật ký
    database.findOne({ GuildId: guild.id }).then(async (getData) => {
      if (!getData) return;
      const channels = guild.channels.cache.find((channel) => {
        return channel.id === getData.guildCreate;
      });
      if (!channels) return;
      let inviteLink = await guilds.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => { });
      let owner = await guild.fetchOwner();
      // Gửi tin nhắn vào chanel
      return channels.send({
        embeds: [new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: owner.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`Tôi đã thêm vào \`${guild.name}\` và tổng số guild của tôi là: \`${client.guilds.cache.size}\``)
          .addFields([
            { name: `👑| Tên chủ sở hữu: `, value: `\`${owner.user.tag}\``, inline: true },
            { name: `👓| ID chủ sở hữu: `, value: `\`${owner.user.id}\``, inline: true },
            { name: `👥| Tổng số thành viên:`, value: `\`${guild.members.cache.size}\``, inline: true },
            { name: `📬| Link tham gia: `, value: `**${inviteLink ? `${inviteLink}` : "không tạo được :("}**`, inline: true },
            { name: `🆔| Guild ID:`, value: `**\`${guild.id}\`**`, inline: true },
            { name: `📅| Tạo lúc:`, value: `**<t:${Date.parse(guild.createdAt) / 1000}:D> | <t:${Date.parse(guild.createdAt) / 1000}:R>**`, inline: true }
          ])
          .setColor("Random")
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setFooter({ text: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp(Date.now())
        ]
      });
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# guildDelete.js
========================================================*/
const guildDelete = new eventBuilders({
  eventCustomName: "guildDelete.js", // Tên sự kiện tùy chọn
  eventName: "guildDelete", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, guild) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

    return database.findOne({ GuildId: guild.id, GuildName: guild.name }).then(async (getData) => {
      if (!getData) return;
      const channels = guild.channels.cache.find((channel) => {
        return channel.id === getData.guildDelete;
      });
      if (!channels) return;
      // lấy owner value
      let owner = await guild.fetchOwner();
      // khởi tạo embeds 
      const embeds = new EmbedBuilder({
        description: `Tôi đã bị kick khỏi \`${guild.name}\` và tổng số guilds còn lại: \`${client.guilds.cache.size}\``,
        footer: { text: client.user.tag, icon_url: client.user.displayAvatarURL({ dynamic: true }) },
        author: { name: guild.name, icon_url: owner.user.displayAvatarURL({ dynamic: true }) },
        thumbnail: { url: guild.iconURL({ dynamic: true }) },
        timestamp: Date.now(),
        fields: [
          { name: `👑| Tên chủ sở hữu: `, value: `\`${owner.user.tag}\``, inline: true },
          { name: `👓| ID chủ sở hữu: `, value: `\`${owner.user.id}\``, inline: true },
          { name: `👥| Tổng số thành viên:`, value: `\`${guild.members.cache.size}\``, inline: true },
          { name: `🆔| Guild ID:`, value: `**\`${guild.id}\`**`, inline: true },
          { name: `📅| tạo lúc:`, value: `**<t:${Date.parse(guild.createdAt) / 1000}:D> | <t:${Date.parse(guild.createdAt) / 1000}:R>**`, inline: true }
        ],
      });
      // gửi tin nhắn vào channel
      return channels.send({ embeds: [embeds] });
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# guildUpdate.js
========================================================*/
const guildUpdate = new eventBuilders({
  eventCustomName: "guildUpdate.js", // Tên sự kiện tùy chọn
  eventName: "guildUpdate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, channel) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

    return database.findOne({ GuildId: channel.guild.id }).then(async (getData) => {
      if (!getData) return;
      const channels = channel.guild.channels.cache.find((_channel) => {
        return _channel.id === getData.channelDelete;
      });
      if (!channels) return;
      if (newGuild.name !== oldGuild.name) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: 'Tên Server đã thay đổi', value: `${oldGuild.name} => ${newGuild.name}` })
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
      } else if (newGuild.iconURL() !== oldGuild.iconURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields('Avatar của server đã thay đổi', `[Avatar cũ](${oldGuild.iconURL()}) => [Avatar mới](${newGuild.iconURL()})`)
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
      } else if (newGuild.splashURL() !== oldGuild.splashURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: "Máy chủ Splash đã thay đổi", value: `[Splash cũ](${oldGuild.splashURL()}) => [Splash mới](${newGuild.splashURL()})` })
            .setThumbnail(`${newGuild.splashURL()}`)
            .setTimestamp()
          ]
        });
      } else if (newGuild.memberCount !== oldGuild.memberCount) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: 'Thành viên server đã thay đổi', value: `${oldGuild.memberCount} => ${newGuild.memberCount}` })
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
      } else if (newGuild.ownerId !== oldGuild.ownerId) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("Server Updates")
            .addFields({ name: 'Chủ sở hữu server đã thay đổi', value: `${oldGuild.owner.user.username} => ${newGuild.owner.user.username}` })
            .setThumbnail(`${newGuild.iconURL()}`)
            .setTimestamp()
          ]
        });
      } else {
        return channels.send({
          content: "Đã sảy ra lỗi trong quá trình thực thi kết quả"
        });
      };
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# guildMemberUpdate.js
========================================================*/
const guildMemberUpdate = new eventBuilders({
  eventCustomName: "guildMemberUpdate.js", // Tên sự kiện tùy chọn
  eventName: "guildMemberUpdate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, oldMember, newMember) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);

    return database.findOne({ GuildId: oldMember.guild.id }).then(async (getData) => {
      if (!getData) return;
      const channels = oldMember.guild.channels.cache.find((channel) => {
        return channel.id === getData.guildMemberUpdate;
      });
      if (!channels) return;
      if (newMember.nickname !== oldMember.nickname) {
        let oldNickname = oldMember.nickname ? oldMember.nickname : oldMember.user.username;
        let newNickname = newMember.nickname ? newMember.nickname : newMember.user.username;
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle(`${newMember.user.tag}`)
            .addFields({ name: 'Biệt danh thành viên đã thay đổi', value: `${oldNickname} => ${newNickname}` })
            .setColor("Yellow")
            .setTimestamp()
            .setThumbnail(`${newMember.user.avatarURL()}`)
          ]
        });
      } else if (newMember.user.username !== oldMember.user.username) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle(`${newMember.user.tag}`)
            .addFields({ name: 'Tên thành viên đã thay đổi', value: `${oldMember.user.username} => ${newMember.user.username}` })
            .setColor("Yellow")
            .setTimestamp()
            .setThumbnail(`${newMember.user.avatarURL()}`)
          ]
        });
      } else if (newMember.user.avatarURL() !== oldMember.user.avatarURL()) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle(`${newMember.user.tag}`)
            .addFields({ name: 'Hình đại diện thành viên đã thay đổi', value: `${oldMember.user.avatarURL()} => ${newMember.user.avatarURL()}` })
            .setColor("Yellow")
            .setTimestamp()
            .setThumbnail(`${newMember.user.avatarURL()}`)
          ]
        });
      } else {
        return channels.send({
          content: "[guildMemberUpdate] Đã sảy ra lỗi trong quá trình thực thi kết quả"
        });
      };
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# voiceStateUpdate.js
========================================================*/
const voiceStateUpdate = new eventBuilders({
  eventCustomName: "voiceStateUpdate.js", // Tên sự kiện tùy chọn
  eventName: "voiceStateUpdate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, oldState, newState) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
    return database.findOne({ GuildId: oldState.guild.id }).then(async (getData) => {
      if (!getData) return;
      const channels = oldState.guild.channels.cache.find((channel) => {
        return channel.id === getData.channelDelete;
      });
      if (!channels) return;
      let oldUser = oldState.member;
      let newUser = newState.member;
      if (oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId !== null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã tham gia kênh voice <#${newUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
      } else if (oldUser.voice.channelId !== newUser.voice.channelId && newUser.voice.channelId === null || undefined) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} rời khỏi kênh voice <#${oldUser.voice.channelId}>`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
      } else if (oldState.mute !== newState.mute) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.mute ? "tắt tiếng" : "bật tiếng"}`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
      } else if (oldState.deaf !== newState.deaf) {
        return channels.send({
          embeds: [new EmbedBuilder()
            .setTitle("Voice State Updates")
            .setDescription(`${newUser} đã ${newState.deaf ? "tắt âm thanh" : "bật âm thanh"}`)
            .setColor("Yellow")
            .setTimestamp()
          ]
        }).catch((ex) => console.log(ex));
      };
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# welcome.js
========================================================*/
const welcome = new eventBuilders({
  eventCustomName: "welcome.js", // Tên sự kiện tùy chọn
  eventName: "guildMemberAdd", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, member) => {
    const welcomeData = database.findOne({ GuildId: member.guild.id });
    if (!welcomeData) return;
    const channels = member.guild.channels.cache.find((channel) => {
      return channel.id === welcomeData.WelcomeChannel;
    });
    if (!channels) return;
    channels.send({
      content: `chào mừng <@${member.user.id}> đã đến với ${member.guild.name}`
    });
  },
});
/*========================================================
# guildMemberRemove.js
========================================================*/
const goodbye = new eventBuilders({
  eventCustomName: "goodbye.js", // Tên sự kiện tùy chọn
  eventName: "guildMemberRemove", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, member) => {
    const goodbyeData = database.findOne({ GuildId: member.guild.id });
    if (!goodbyeData) return;
    const channels = member.guild.channels.cache.find((channel) => {
      return channel.id === goodbyeData.GoodbyeChannel;
    });
    if (!channels) return;
    channels.send({
      content: `Tạm biệt <@${member.user.id}>`
    });
    /*
    return database.findOne({ GuildId: member.guild.id }).then(async(getData) => {
      const Canvas = require('canvas');
      if(!getData) return; // nếu không có data, return
      const channels = member.guild.channels.cache.find((channel) => {
        return channel.id === getData.GoodbyeChannel;
      });
      if(!channels) return; // nếu không thấy channel, return 
      const canvas = Canvas.createCanvas(1772, 633);     
      const ctx = canvas.getContext('2d');     
      const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/1055150050357022843/1089624908570566836/welcome.png");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#f2f2f2';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      var textString3 = `${member.user.username}`;
      if(textString3.length >= 14) {
        ctx.font = 'bold 100px Genta';
        ctx.fillStyle = '#f2f2f2';
        ctx.fillText(textString3, 720, canvas.height / 2 + 20);
      } else {
        ctx.font = 'bold 150px Genta';
        ctx.fillStyle = '#f2f2f2';
        ctx.fillText(textString3, 720, canvas.height / 2 + 20);
      };
      var textString2 = `#${member.user.discriminator}`;
      ctx.font = 'bold 40px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString2, 730, canvas.height / 2 + 58);      
      var textString4 = `Còn lại ${member.guild.memberCount} thành viên.`;
      ctx.font = 'bold 60px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString4, 750, canvas.height / 2 + 125);      
      var textString5 = `${member.guild.name}`;
      ctx.font = 'bold 60px Genta';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(textString5, 700, canvas.height / 2 - 150);
      ctx.beginPath();
      ctx.arc(315, canvas.height / 2, 250, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: "jpg" }));
      ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);      
      channels.send({ 
        files: [new AttachmentBuilder(canvas.toBuffer(), { 
          name: 'goodbye-image.png' 
        })]
      }); 
    }).catch((Error) => {
       if(Error) return console.log(Error);
    });
    */
  },
});
/*========================================================
# autoplayMusic.js
========================================================*/
const autoPlayMusic = new eventBuilders({
  eventCustomName: "autoPlayMusic.js", // Tên sự kiện tùy chọn
  eventName: "messageCreate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, message) => {
    return PlayMusicData.findOne({ GuildId: message.guild?.id }).then(async (data) => {
      if (!data) return;
      if (!message.guild || !message.guild.available) return;
      if (!data.ChannelId || data.ChannelId.length < 5) return;
      let textChannel = message.guild.channels.cache.get(data.ChannelId) || await message.guild.channels.fetch(data.ChannelId).catch(() => { }) || false;
      if (!textChannel) return console.log("Không có channel nào được thiết lập");
      if (textChannel.id != message.channel.id) return;
      // xoá tin nhắn 
      if (message.author.id === client.user.id) {
        setTimeout(() => {
          if (!message.deleted) {
            message.delete().catch(() => { });
          };
        }, 3000);
      } else {
        if (!message.deleted) {
          message.delete().catch((e) => { });
        };
      };
      if (message.author.bot) return;
      // kiểm tra xem thành viên có ở trong voice hay không
      if (!await message.member.voice.channel) return message.channel.send({
        content: "Bạn cần phải ở trong một kênh voice"
      });
      // yêu cầu phát nhạc
      await client.distube.play(message.member.voice.channel, message.cleanContent, {
        member: message.member,
        textChannel: message.channel,
        message,
      });
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# musicInteraction.js
========================================================*/
const musicInteraction = new eventBuilders({
  eventCustomName: "musicInteraction.js", // Tên sự kiện tùy chọn
  eventName: "interactionCreate", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async (client, interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    var { guild, message, channel, member, user, customId } = interaction;
    const data = await PlayMusicData.findOne({ GuildId: interaction.guild.id });
    if (!data) return; // trả về nếu không tìm thấy data
    if (!guild) guild = client.guilds.cache.get(interaction.guildId);
    if (!guild) return; // trả về nếu không tìm thấy guilds
    // nếu chưa setup, return
    if (!data.ChannelId || data.ChannelId.length < 5) return;
    if (!data.MessageId || data.MessageId.length < 5) return;
    // nếu kênh không tồn tại, hãy thử lấy và trả về nếu vẫn không tồn tại
    if (!channel) channel = guild.channels.cache.get(interaction.channelId);
    if (!channel) return;
    // nếu không đúng kênh quay lại
    if (data.ChannelId != channel.id) return;
    //nếu không đúng tin nhắn, return
    if (data.MessageId != message.id) return;
    if (!member) member = guild.members.cache.get(user.id);
    if (!member) member = await guild.members.fetch(user.id).catch(() => { });
    if (!member) return;
    // nếu thành viên không được kết nối với voice, return
    if (!member.voice.channel) return interaction.reply({
      content: `**Vui lòng kết nối với kênh voice trước!**`
    });
    let newQueue = client.distube.getQueue(guild.id);
    if (interaction.isButton()) {
      if (!newQueue || !newQueue.songs || !newQueue.songs[0]) return interaction.reply({
        content: "Hiện tại không phát bài hát nào :))"
      });
      if (customId === "Stop") {
        if (newQueue) {
          await newQueue.stop();
        };
        return interaction.reply({ content: "⏹ **Dừng phát và rời khỏi Kênh**" });
      } else if (customId === "Skip") {
        try {
          if (newQueue.songs.length == 0) {
            await newQueue.stop();
            return interaction.reply({ content: "Ngừng phát và rời khỏi Kênh" });
          };
          await newQueue.skip();
          return interaction.reply({ content: "⏭ **Đã chuyển sang Bài hát tiếp theo!**" });
        } catch (e) {
          return interaction.reply({ content: "Bạn chỉ có 1 bài hát trong danh sách phát" });
        };
      } else if (customId === "Pause") {
        if (newQueue.paused) {
          newQueue.resume();
          return interaction.reply({ content: "Tiếp tục phát nhạc" });
        } else {
          await newQueue.pause();
          return interaction.reply({ content: "Tạm dừng phát nhạc" });
        };
      } else if (customId === "Autoplay") {
        newQueue.toggleAutoplay();
        return interaction.reply({ content: `Tự động phát đã được ${newQueue.autoplay ? "bật" : "tắt"}` });
      } else if (customId === "Shuffle") {
        client.maps.set(`beforeshuffle-${newQueue.id}`, newQueue.songs.map(track => track).slice(1));
        await newQueue.shuffle();
        return interaction.reply({ content: `Đã xáo trộn ${newQueue.songs.length} bài hát` });
      } else if (customId === "Song") {
        if (newQueue.repeatMode == 1) {
          await newQueue.setRepeatMode(0);
        } else {
          await newQueue.setRepeatMode(1);
        };
        return interaction.reply({ content: `${newQueue.repeatMode == 1 ? "Đã bật vòng lặp bài hát" : "Đã tắt vòng lặp bài hát"}` });
      } else if (customId === "Queue") {
        if (newQueue.repeatMode == 2) {
          await newQueue.setRepeatMode(0);
        } else {
          await newQueue.setRepeatMode(2);
        };
        return interaction.reply({ content: `${newQueue.repeatMode == 2 ? "Đã bật vòng lặp hàng đợi" : "Đã tắt vòng lặp bài hát"}` });
      } else if (customId === "Forward") {
        let seektime = newQueue.currentTime + 10;
        if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
        await newQueue.seek(seektime);
        return interaction.reply({ content: "Đã tua bài hát về trước 10 giây" });
      } else if (customId === "VolumeUp") {
        try {
          const volumeUp = Number(newQueue.volume) + 10;
          if (volumeUp < 0 || volumeUp > 100) return interaction.reply({
            embeds: [new EmbedBuilder().setColor("Random").setDescription("Bạn chỉ có thể đặt âm lượng từ 0 đến 100.").setTimestamp()], ephemeral: true
          });
          await newQueue.setVolume(volumeUp);
          await interaction.reply({ content: `:white_check_mark: | Âm lượng tăng lên ${volumeUp}%` });
        } catch (error) {
          console.log(error);
        };
      } else if (customId === "VolumeDown") {
        try {
          const volumeDown = Number(newQueue.volume) - 10;
          const invalidVolume = new EmbedBuilder().setColor("Random").setDescription(":x: | Không thể giảm âm lượng của bạn nữa nếu tiếp tục giảm bạn sẽ không nghe thấy gì").setTimestamp();
          if (volumeDown <= 0) return interaction.reply({ embeds: [invalidVolume] });
          await newQueue.setVolume(volumeDown);
          await interaction.reply({ content: `:white_check_mark: | Âm lượng giảm xuống ${volumeDown}%` });
        } catch (error) {
          console.log(error);
        };
      } else if (customId === "Rewind") {
        let seektime = newQueue.currentTime - 10;
        if (seektime < 0) seektime = 0;
        if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
        await newQueue.seek(seektime);
        return interaction.reply({ content: "Đã tua bài hát về sau 10 giây" });
      } else if (customId === "Lyrics") {
        await interaction.reply({ content: "Đang tìm kiếm lời bài hát", embeds: [], ephemeral: true });
        let thumbnail = newQueue.songs.map((song) => song.thumbnail).slice(0, 1).join("\n");
        let name = newQueue.songs.map((song) => song.name).slice(0, 1).join("\n");
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setAuthor({ name: name, iconURL: thumbnail, url: newQueue.songs.map((song) => song.url).slice(0, 1).join("\n") })
            .setColor("Random")
            .setThumbnail(thumbnail)
            .setDescription((await require("lyrics-finder")(newQueue.songs.map((song) => song.uploader.name).slice(0, 1).join("\n"), name)) || "Không tìm thấy lời bài hát!")
          ], ephemeral: true
        });
      };
      client.updateMusicSystem(newQueue);
    } else if (interaction.isStringSelectMenu()) {
      let link;
      if (interaction.values[0]) {
        //gaming
        if (interaction.values[0].toLowerCase().startsWith(`g`)) link = `https://open.spotify.com/playlist/4a54P2VHy30WTi7gix0KW6`;
        //ncs | no copyrighted music
        if (interaction.values[0].toLowerCase().startsWith(`n`)) link = `https://open.spotify.com/playlist/7sZbq8QGyMnhKPcLJvCUFD`;
      };
      await interaction.reply({ content: `Đang tải **${interaction.values[0]}**`, ephemeral: true });
      try {
        await client.distube.play(member.voice.channel, link, { member: member });
        return interaction.editReply({ content: `${newQueue?.songs?.length > 0 ? "👍 Thêm vào" : "🎶 Đang phát"}: **'${interaction.values[0]}'**`, ephemeral: true });
      } catch (e) {
        console.log(e);
      };
    };
  },
});
/*========================================================
# afkEvent.js
========================================================*/
const afkEvent = new eventBuilders({
  eventCustomName: "afk.js", // Tên sự kiện tùy chọn
  eventName: "messageCreate", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client, message) => {
    if (message.author.bot) return;
    const afkcheck = await afkSchema.findOne({ GuildId: message.guild.id, UserId: message.author.id });
    if (afkcheck) {
      const nick = afkcheck.Nickname;
      await afkSchema.deleteMany({
        GuildId: message.guild.id,
        UserId: message.author.id
      });
      await message.member.setNickname(`${nick}`).catch((err) => {
        return console.log("Thiếu quyền");
      });
      const m1 = await message.reply({ content: `Này, bạn đã ** trở lại **!`, ephemeral: true });
      setTimeout(() => {
        m1.delete();
      }, 10000);
    } else {
      const members = message.mentions.users.first();
      if (!members) return;
      const afkData = await afkSchema.findOne({ GuildId: message.guild.id, UserId: members.id });
      if (!afkData) return;
      const member = message.guild.members.cache.get(members.id);
      const msg = afkData.Message;
      if (message.content.includes(members)) {
        const m = await message.reply({ content: `${member.user.tag} hiện đang AFK\n> **Lý do**: ${msg}`, ephemeral: true });
        setTimeout(() => {
          m.delete();
          message.delete();
        }, 10000);
      };
    };
  },
});
/*========================================================
# ticket.js
========================================================*/
const ticket = new eventBuilders({
  eventCustomName: "ticket.js", // Tên sự kiện tùy chọn
  eventName: "interactionCreate", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client, interaction) => {
    const sourcebin = require("sourcebin_js");
    const settings = {
      ticket: {
        limit: 10,
        categories: {
          name: ""
        },
      },
    };
    const openPerms = ["ManageChannels"];
    const closePerms = ["ManageChannels", "ReadMessageHistory"];
    const isTicketChannel = (channel) => {
      return (channel.type === ChannelType.GuildText && channel.name.startsWith("tіcket-") && channel.topic && channel.topic.startsWith("tіcket|"));
    };
    const getTicketChannels = (guild) => {
      return guild.channels.cache.filter((ch) => isTicketChannel(ch));
    };
    const getExistingTicketChannel = (guild, userId) => {
      const tktChannels = getTicketChannels(guild);
      return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
    };
    const closeTicket = async (channel, closedBy, reason) => {
      if (!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(closePerms)) return "missingPermissions";
      try {
        const messages = await channel.messages.fetch();
        const reversed = Array.from(messages.values()).reverse();
        let content = "";
        reversed.forEach((m) => {
          content += `[${new Date(m.createdAt).toLocaleString("vi-VN")}] - ${m.author.tag}\n`;
          if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
          if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
          content += "\n";
        });
        const postToBin = async (content, title = `Nhật ký ticket cho ${channel.name}`) => {
          try {
            const response = await sourcebin.create([{ name: " ", content, languageId: "text" }], { title, description: " " });
            return {
              url: response.url,
              short: response.short,
              raw: `https://cdn.sourceb.in/bins/${response.key}/0`,
            };
          } catch (ex) {
            console.log(`postToBin`, ex);
          };
        };
        const logsUrl = await postToBin(content);
        const parseTicketDetails = async (channel) => {
          if (!channel.topic) return;
          const split = channel.topic?.split("|");
          const catName = split[2] || "Mặc định";
          const user = await channel.client.users.fetch(split[1], {
            cache: false
          }).catch(() => { });
          return { user, catName };
        };
        const ticketDetails = await parseTicketDetails(channel);
        const components = [];
        if (logsUrl) {
          components.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Lịch sử tin nhắn").setURL(logsUrl.short).setStyle(ButtonStyle.Link)));
        };
        if (channel.deletable) await channel.delete();
        const embed = new EmbedBuilder().setAuthor({ name: "Đóng Ticket" }).setColor("Red");
        const fields = [];
        if (reason) fields.push({ name: "Lý do", value: reason, inline: false });
        fields.push(
          { name: "mở bởi", value: ticketDetails.user ? ticketDetails.user.tag : "Không xác định", inline: true },
          { name: "đóng bởi", value: closedBy ? closedBy.tag : "Không xác định", inline: true }
        );
        embed.setFields(fields);
        // gửi Embed cho người dùng
        if (ticketDetails.user) {
          ticketDetails.user.send({ embeds: [embed.setDescription(`**Tên server:** ${channel.guild.name}\n**Thể loại:** ${ticketDetails.catName}`).setThumbnail(channel.guild.iconURL())], components }).catch((ex) => { });
        };
        return "SUCCESS";
      } catch (ex) {
        console.log("closeTicket", ex);
        return "ERROR";
      };
    };
    const closeAllTickets = async (guild, author) => {
      const channels = getTicketChannels(guild);
      let success = 0, failed = 0;
      for (const ch of channels) {
        const status = await closeTicket(ch[1], author, "Buộc đóng tất cả các ticket đang mở");
        if (status === "SUCCESS") {
          success += 1;
        } else failed += 1;
      };
      return [success, failed];
    };
    const ticketModalSetup = async ({ channel, member }) => {
      const sentMsg = await channel.send({
        content: "Vui lòng bấm vào nút bên dưới để thiết lập tin nhắn ticket",
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("cài đặt tin nhắn").setStyle(ButtonStyle.Primary))],
      });
      if (!sentMsg) return;
      const btnInteraction = await channel.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
        time: 20000,
      }).catch((ex) => { });
      if (!btnInteraction) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
      await btnInteraction.showModal(new ModalBuilder({
        customId: "ticket-modalSetup",
        title: "Thiết lập Ticket",
        components: [
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("title").setLabel("Tiêu đề Embed").setStyle(TextInputStyle.Short).setRequired(false)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("description").setLabel("Mô tả Embed").setStyle(TextInputStyle.Paragraph).setRequired(false)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("footer").setLabel("Chân trang Embed").setStyle(TextInputStyle.Short).setRequired(false)),
        ],
      }));
      const modal = await btnInteraction.awaitModalSubmit({
        time: 1 * 60 * 1000,
        filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
      }).catch((ex) => { });
      if (!modal) return sentMsg.edit({ content: "Không nhận được phản hồi, đang hủy thiết lập", components: [] });
      await modal.reply("Thiết lập tin nhắn ticket ...");
      await channel.send({
        embeds: [new EmbedBuilder()
          .setColor("Random")
          .setAuthor({ name: modal.fields.getTextInputValue("title") || "Ticket" })
          .setDescription(modal.fields.getTextInputValue("description") || "Vui lòng sử dụng nút bên dưới để tạo ticket")
          .setFooter({ text: modal.fields.getTextInputValue("footer") || "Bạn chỉ có thể mở 1 ticket tại một thời điểm!" })
        ],
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Mở ticket").setCustomId("TicketCreate").setStyle(ButtonStyle.Success))]
      });
      await modal.deleteReply();
      await sentMsg.edit({ content: "Xong! Đã tạo thông báo ticket", components: [] });
    };
    /**  */
    async function close({ channel }, author) {
      if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      const status = await closeTicket(channel, author, "Đã đóng bởi người kiểm duyệt");
      if (status === "missingPermissions") return "Tôi không có quyền đóng tickets";
      if (status === "ERROR") return "Đã xảy ra lỗi khi đóng ticket";
      return null;
    };
    /**  */
    async function closeAll({ guild }, user) {
      const stats = await closeAllTickets(guild, user);
      return `Xong!, Thành công: \`${stats[0]}\` Thất bại: \`${stats[1]}\``;
    };
    /**  */
    async function addToTicket({ channel }, inputId) {
      if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      if (!inputId || isNaN(inputId)) return "Oops! Bạn cần nhập một giá trị hợp lệ userId/roleId";
      try {
        await channel.permissionOverwrites.create(inputId, {
          ViewChannel: true,
          SendMessages: true,
        });
        return `Đã thêm thành viên <@${inputId}> vào ticket`;
      } catch (ex) {
        return "Không thể thêm người dùng/Roles. Bạn đã cung cấp ID hợp lệ chưa?";
      };
    };
    /** */
    async function removeFromTicket({ channel }, inputId) {
      if (!isTicketChannel(channel)) return "Lệnh này chỉ có thể được sử dụng trong kênh ticket";
      if (!inputId || isNaN(inputId)) return "Bạn cần nhập một giá trị hợp lệ userId/roleId";
      try {
        channel.permissionOverwrites.create(inputId, {
          ViewChannel: false,
          SendMessages: false,
        });
        return "Đã xoá thành viên ra khỏi ticket!";
      } catch (ex) {
        return "Không thể xóa người dùng hoặc roles. Bạn có cung cấp ID hợp lệ không?";
      };
    };
    /*========================================================
    # Clicker Handlers
    ========================================================*/
    if (interaction.isButton()) {
      if (interaction.customId === "TicketCreate") {
        await interaction.deferReply({ ephemeral: true });
        const { guild, user } = interaction;
        if (!guild.members.me.permissions.has(openPerms)) return interaction.editReply("Không thể tạo kênh ticket, thiếu quyền `Quản lý kênh`. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
        const alreadyExists = getExistingTicketChannel(guild, user.id);
        if (alreadyExists) return interaction.editReply(`Bạn đã có một ticket đang mở`);
        // kiểm tra giới hạn
        const existing = getTicketChannels(guild).size;
        if (existing > settings.ticket.limit) return interaction.editReply("Có quá nhiều ticket đang mở. Hãy thử lại sau");
        // kiểm tra danh mục
        let catName = null;
        let catPerms = [];
        const categories = settings.ticket.categories;
        if (categories.length > 0) {
          const options = [];
          settings.ticket.categories.forEach((cat) => options.push({ label: cat.name, value: cat.name }));
          await interaction.editReply({
            content: "Vui lòng chọn loại ticket",
            components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("ticket-menu").setPlaceholder("Chọn loại ticket").addOptions(options))]
          });
          const res = await interaction.channel.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: 60 * 1000,
          }).catch((err) => {
            if (err.message.includes("time")) return;
          });
          if (!res) return interaction.editReply({ content: "Hết giờ. Thử lại", components: [] });
          await interaction.editReply({ content: "Xử lý", components: [] });
          catName = res.values[0];
          catPerms = categories.find((cat) => cat.name === catName) || [];
        };
        try {
          const permissionOverwrites = [
            { id: guild.roles.everyone, deny: ["ViewChannel"] },
            { id: user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
            { id: guild.members.me.roles.highest.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
          ];
          if (catPerms?.length > 0) {
            catPerms?.forEach((roleId) => {
              const role = guild.roles.cache.get(roleId);
              if (!role) return;
              permissionOverwrites.push({
                id: role,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
              });
            });
          };
          const countTicket = (existing + 1).toString();
          const tktChannel = await guild.channels.create({
            name: `tіcket-${countTicket}`,
            type: ChannelType.GuildText,
            topic: `tіcket|${user.id}|${catName || "Mặc định"}`,
            permissionOverwrites,
          });
          const sent = await tktChannel.send({
            content: user.toString(),
            embeds: [new EmbedBuilder().setAuthor({ name: `Ticket #${countTicket}` }).setDescription(`Xin chào ${user.toString()}\nNhân viên hỗ trợ sẽ đến với bạn trong thời gian ngắn\n${catName ? `\n**Loại:** ${catName}` : ""}`).setFooter({ text: "Bạn có thể đóng ticket của mình bất cứ lúc nào bằng cách nhấp vào nút bên dưới" })],
            components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Hủy Ticket").setCustomId("TicketClose").setEmoji("🔒").setStyle(ButtonStyle.Primary))]
          });
          user.send({
            embeds: [new EmbedBuilder().setColor("Random").setAuthor({ name: "Ticket Created" }).setThumbnail(guild.iconURL()).setDescription(`**Máy chủ:** ${guild.name}\n${catName ? `**Loại:** ${catName}` : ""}`)],
            components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Xem kênh ticket").setURL(sent.url).setStyle(ButtonStyle.Link))]
          }).catch((ex) => { });
          await interaction.editReply({
            content: `Đã tạo Ticket! hãy bấm vào nút bên dưới để di chuyển đến kênh của bạn 🎫, sau 5 giây tin nhắn sẽ tự động được xoá`,
            components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("xem kênh ticket").setURL(sent.url).setStyle(ButtonStyle.Link).setEmoji("1091770710915022858"))],
          }).then(() => setTimeout(() => interaction.deleteReply(), 5000));
        } catch (ex) {
          console.log(ex);
          return interaction.editReply("Không thể tạo kênh ticket, đã xảy ra lỗi!");
        };
      } else if (interaction.customId === "TicketClose") {
        await interaction.deferReply({ ephemeral: true });
        const status = await closeTicket(interaction.channel, interaction.user);
        if (status === "missingPermissions") {
          return interaction.editReply("Không thể đóng ticket, thiếu quyền. Hãy liên hệ với người quản lý máy chủ để được trợ giúp!");
        } else if (status == "ERROR") {
          return interaction.editReply("Không thể đóng vé, đã xảy ra lỗi!");
        };
      };
    };
    /*========================================================
    # khởi chạy các func
    ========================================================*/
    client.ticketModalSetup = ticketModalSetup;
    client.removeFromTicket = removeFromTicket;
    client.addToTicket = addToTicket;
    client.ticketCloseAll = closeAll;
    client.ticketClose = close;
  },
});
/*========================================================
# joinCreateVoice.js
========================================================*/
const joinCreateVoice = new eventBuilders({
  eventCustomName: "joinCreateVoice.js", // Tên sự kiện tùy chọn
  eventName: "voiceStateUpdate", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client, oldState, newState) => {
    const database = require(`${process.cwd()}/Assets/Schemas/logChannels`);
    let voiceManager = new Collection();
    return database.findOne({ GuildId: oldState.guild.id }).then(async (getData) => {
      if (!getData) return;
      const channel = oldState.guild.channels.cache.find((channel) => {
        return channel.id === getData.ChannelAutoCreateVoice;
      });
      if (!channel) return;
      const { member, guild } = oldState;
      const newChannel = newState.channel;
      const oldChannel = oldState.channel;
      if (oldChannel !== newChannel && newChannel && newChannel.id === channel.id) {
        const voiceChannel = await guild.channels.create({
          name: `${member.user.tag}`,
          type: ChannelType.GuildVoice,
          parent: newChannel.parent,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ["Connect", "ManageChannels"],
            },
            {
              id: guild.id,
              allow: ["Connect"],
            },
          ],
          userLimit: 30
        });
        voiceManager.set(member.id, voiceChannel.id);
        await newChannel.permissionOverwrites.edit(member, {
          Connect: false
        });
        setTimeout(() => {
          newChannel.permissionOverwrites.delete(member);
        }, 30000);
        return setTimeout(() => {
          member.voice.setChannel(voiceChannel);
        }, 500);
      };
      const jointocreate = voiceManager.get(member.id);
      const members = oldChannel?.members.filter((m) => !m.user.bot).map((m) => m.id);
      if (jointocreate && oldChannel.id === jointocreate && (!newChannel || newChannel.id !== jointocreate)) {
        if (members.length > 0) {
          let randomID = members[Math.floor(Math.random() * members.length)];
          let randomMember = guild.members.cache.get(randomID);
          randomMember.voice.setChannel(oldChannel).then((v) => {
            oldChannel.setName(randomMember.user.username).catch((e) => null);
            oldChannel.permissionOverwrites.edit(randomMember, {
              Connect: true,
              ManageChannels: true
            });
          });
          voiceManager.set(member.id, null);
          voiceManager.set(randomMember.id, oldChannel.id);
        } else {
          voiceManager.set(member.id, null);
          oldChannel.delete().catch((e) => null);
        };
      };
    }).catch((Error) => {
      if (Error) return console.log(Error);
    });
  },
});
/*========================================================
# discordInteraction.js
========================================================*/
const discordInteraction = new eventBuilders({
  eventCustomName: "buttonCustom", // Tên sự kiện tùy chọn
  eventName: "interactionCreate", // tên events
  eventOnce: false, // bật lên nếu chỉ thực hiện nó 1 lần
  executeEvents: async (client, interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === "inviteBot") {
        interaction.reply({ content: `[Bấm vào đây](${config.discordBot})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => { });
      } else if (interaction.customId === "inviteDiscord") {
        interaction.reply({ content: `[Bấm vào đây](${config.discord})` }).then(() => {
          setTimeout(() => interaction.deleteReply(), 5000);
        }).catch(() => { });
      };
    };
  },
});

module.exports = [
  createSchemas,
  ready,
  messageCreate,
  interactionCreate,
  guildCreate,
  guildDelete,
  guildUpdate,
  sendMessage,
  guildMemberUpdate,
  voiceStateUpdate,
  discordInteraction,
  musicInteraction,
  joinCreateVoice,
  autoPlayMusic,
  afkEvent,
  welcome,
  goodbye,
  ticket
];