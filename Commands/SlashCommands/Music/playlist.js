const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { Playlist } = require(`${process.cwd()}/Assets/Schemas/database`);

module.exports = {
  name: "playlists", // Tên lệnh 
  description: "phát nhạc theo playlist", // Mô tả lệnh
  userPerms: [], // quyền của thành viên có thể sử dụng lệnh
  owner: false, // true để chuyển thành lệnh của chủ bot, false để tắt
  cooldown: 3, // thời gian hồi lệnh
  options: [
    { 
      name: "create", 
      description: "Tạo một danh sách phát mới.", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "name", 
          description: "Tên của danh sách phát (Sử dụng 1 từ để tối ưu ).", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{ 
      name: "deleted", 
      description: "xoá một danh sách phát.", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "id của danh sách phát", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{ 
      name: "add", 
      description: "Thêm một bài hát vào danh sách phát.", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "Id của danh sách phát.", 
          type: ApplicationCommandOptionType.String,
          required: true
        },{
          name: "song-name", 
          description: "Tên hoặc URL của bài hát.", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{ 
      name: "info", 
      description: "Xem thông tin của một danh sách phát", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "id của danh sách phát", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{ 
      name: "list", 
      description: "Liệt kê danh sách phát của bạn", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "options", 
          description: "Lựa chọn của bạn.", 
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'Công cộng', value: 'public' },
            { name: 'Riêng tư', value: 'private' }
          ]
        }
      ],
    },{ 
      name: "play", 
      description: "Phát nhạc trong danh sách phát", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "id của danh sách phát", 
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],
    },{ 
      name: "privacy", 
      description: "Thay đổi quyền riêng tư của danh sách phát", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "id của danh sách phát", 
          type: ApplicationCommandOptionType.String,
          required: true
        },{
          name: "options", 
          description: "Quyền riêng tư của danh sách phát.", 
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'Công cộng', value: 'public' },
            { name: 'Riêng tư', value: 'private' }
          ]
        }
      ],
    },{ 
      name: "remove", 
      description: "Xóa một bài hát khỏi danh sách phát.", 
      type: ApplicationCommandOptionType.Subcommand, 
      options: [
        {
          name: "playlist-id", 
          description: "id của danh sách phát", 
          type: ApplicationCommandOptionType.String,
          required: true
        },{
          name: "song-position", 
          description: "Vị trí của bài hát cần xóa.", 
          type: ApplicationCommandOptionType.Integer,
          required: true
        }
      ],
    },
  ],
  run: async(client, interaction) => {
    const { options, guild, user, member, channel } = interaction;
    if(options.getSubcommand() === "create") {
      const playlistName = options.getString('name').toLowerCase();
      let data = await Playlist.findOne({ userId: user.id });
      if(!data) {
        await Playlist.create({
          userId: user.id,
          guildId: guild.id,
          name: playlistName,
          privacy: true,
        });
      } else {
        if(data.name.includes(playlistName)) return interaction.reply({
          content: `Đã có danh sách tên ${playlistName}`
        });
        await Playlist.create({
          userId: user.id,
          guildId: guild.id,
          name: playlistName,
          privacy: true,
        });
      };
      return interaction.reply({ 
        embeds: [new EmbedBuilder({ description: `✅ | Đã thêm danh sách **${playlistName.toUpperCase()}** được tạo bởi ${user}, sử dụng \`/playlist list\` để xem ID danh sách và \`/playlist privacy\` để chuyển quyền riêng tư`, color: 0x2a9454 })]
      });
    } else if(options.getSubcommand() === "deleted") {
      const queueId = options.getString('playlist-id');
      const data = await Playlist.findOne({ _id: queueId }).catch(() => {
        return interaction.reply({ content: 'Danh sách phát này không tồn tại.' });
      });
      if(data.userId !== user.id) return interaction.reply({
        content: "Bạn chỉ có thể xóa danh sách phát của riêng mình"
      });
      await Playlist.deleteOne({ _id: queueId });
      return interaction.reply({ embeds: [new EmbedBuilder()
        .setColor('#2a9454')
        .setDescription(`✅ | Đã xóa thành công Danh sách phát có ID được liên kết: **${queueId}**`)
      ]});
    } else if(options.getSubcommand() === "add") {
      const song = options.getString('song-name');
      const data = await Playlist.findOne({ 
        _id: options.getString('playlist-id') 
      }).catch(() => interaction.reply({ content: 'Danh sách phát này không tồn tại.' }));
      if(data.userId !== user.id) return interaction.channel.send({ 
        content: "Bạn chỉ có thể thêm các bài hát vào danh sách phát của riêng mình"
      });
      const songData = await client.distube.search(song, {
        limit: 1 
      }).catch(() => interaction.reply({ content: 'Không tìm thấy bài hát nào.' }));

      const url = songData[0].url;
      const name = songData[0].name;

      if(data.songs.url.includes(url)) return interaction.reply({ 
        content: "Bài hát này đã có trong danh sách phát"
      });
      
      data.songs.url.push(url);
      data.songs.name.push(name);
      await data.save();

      return interaction.reply({ embeds: [new EmbedBuilder()
        .setColor('#2a9454')
        .setTitle('📜 | Thông tin danh sách phát')
        .setDescription(`✅ | Đã thêm thành công **[${name}](${url})** vào Danh sách phát`),
      ]});
    } else if(options.getSubcommand() === "info") {
      const queueId = options.getString('playlist-id');
      const data = await Playlist.findOne({ _id: queueId }).catch(() => {
        return interaction.reply({ content: 'Danh sách phát này không tồn tại. Sử dụng \`/playlist list\` để xem id của danh sách phát' });
      });
      const User = guild.members.cache.get(data.userId);
      let privacy;
      if(data.privacy === true) {
        privacy = 'Riêng tư';
      } else privacy = 'Công cộng';
      const rawFields = data.songs.name;
      let index = 1;
      const fields = rawFields.map(field => {
        return [`**${index++}.** [${field}](${data.songs.url[index - 2]})`].join('\n');
      }).join('\n');

      return interaction.reply({ embeds: [new EmbedBuilder()
        .setColor('#2a9454')
        .setTitle('📜 | Thông tin danh sách phát')
        .setDescription(`**Tên:** ${data.name.toUpperCase()}\n**ID:** ${queueId}\n**Trạng thái:** ${privacy}\n**Bài hát:**\n ${fields}\n**Được tạo bởi:** ${User}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'BlackCat-Club', })
        .setTimestamp(),
      ]});
    } else if(options.getSubcommand() === "list") {
      const choices = options.getString('options');
      if(choices === "public") {
        const data = await Playlist.find({ privacy: false });
        if(!data?.length) return interaction.reply({
          content: "Không có danh sách phát nào được công khai."
        });
        let index = 1;
        const queueData = data.map((queue) => {
          return [`**${index++}.** ${queue.name.toUpperCase()} - \`${queue._id}\``].join('\n');
        }).join('\n');
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setTitle('📃 | Danh sách phát công khai')
          .setDescription(`${queueData}`)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setFooter({ text: 'BlackCat-Club', })
          .setTimestamp(),
        ]});
      } else if(choices === "private") {
        const data = await Playlist.find({ userId: user.id, privacy: true });
        if(!data?.length) return interaction.reply({
          content: "Bạn không có danh sách phát riêng tư nào"
        });
        let index = 1;
        const queueData = data.map(queue => {
          return [`**${index++}.** ${queue.name.toUpperCase()} - \`${queue._id}\``].join('\n');
        }).join('\n');
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setTitle('📃 | Danh sách phát riêng tư')
          .setDescription(`${queueData}`)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setFooter({ text: 'BlackCat-Club', })
          .setTimestamp(),
        ]});
      };
    } else if(options.getSubcommand() === "play") {
      const VoiceChannel = member.voice.channel;
      if(!VoiceChannel) return interaction.reply({
        content: '🚫 | Bạn phải ở trong một phòng Voice để sử dụng lệnh này !'
      });
      const queue = await client.distube.getQueue(VoiceChannel);
      if(queue && guild.members.me.voice.channelId && VoiceChannel.id !== guild.members.me.voice.channelId) return interaction.reply({ 
        content: `🚫 | Bạn phải ở cùng một phòng Voice để sử dụng lệnh này. Bài hát đang được phát tại ${guild.members.me.voice.channel}` 
      });
      const queueId = options.getString('playlist-id');
      const data = await Playlist.findOne({ _id: queueId }).catch(() => {
        return interaction.reply({ content: 'Danh sách phát không tồn tại' });
      });
      if(data.privacy === true) {
        const User = client.users.cache.get(data.userId);
        if(data.userId !== user.id) return interaction.reply({
          content: `Danh sách này ở chế độ private, chỉ có ${User.tag} mới sử dụng được.`
        });
        const songs = data.songs.url;
        const names = data.songs.name;
        if(!songs?.length) return interaction.reply({
          content:  'Danh sách này trống. Vui lòng sử dụng `/playlist add` để thêm bài hát.'
        });
        const playlist = await client.distube.createCustomPlaylist(songs, {
          member,
          properties: { name: `${names}` },
          parallel: true,
        });
        await client.distube.play(VoiceChannel, playlist, {
          textChannel: channel,
          member,
        });
        return interaction.channel.send({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setDescription(`✅ | Danh sách có ID: **${queueId}** đã được phát.`),
        ]});
      } else {
        const songs = data.songs.url;
        const names = data.songs.name;
        if(songs.length === 0) return interaction.reply({
          content: 'Danh sách này trống. Vui lòng sử dụng `/playlist add` để thêm bài hát.'              
        });
        const playlist = await client.distube.createCustomPlaylist(songs, {
          member,
          properties: { name: `${names}` },
          parallel: true,
        });
        await client.distube.play(VoiceChannel, playlist, {
            textChannel: channel,
            member,
        });
        return interaction.channel.send({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setDescription(`✅ | Danh sách có ID: **${queueId}** đã được phát.`),
        ]});
      };
    } else if(options.getSubcommand() === "privacy") {
      const playlistId = options.getString('playlist-id');
      const choices = options.getString('options');
      let data = await Playlist.findOne({
        userId: user.id,
        _id: playlistId,
      });
      if(!data) return interaction.reply({ 
        content: 'Bạn không có danh sách phát nào.' 
      });
      if(user.id !== data.userId) return interaction.reply({ 
        content: 'Bạn không có quyền thay đổi chế độ riêng tư của danh sách phát này.' 
      });
      if(choices === "public") {
        if(data.privacy === false) return interaction.reply({ 
          content: 'Danh sách phát này đã được công khai.'
        });
        data.privacy = false;
        await data.save();
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setDescription(`✅ | Chế độ bảo mật của danh sách phát **${data.name.toUpperCase()}** đã được thay đổi thành **CÔNG CỘNG**`),
        ]});
      } else if(choices === "private") {
        if(data.privacy === true) return interaction.reply({ 
          content: 'Danh sách phát này đã được riêng tư.'
        });
        data.privacy = true;
        await data.save();
        return interaction.reply({ embeds: [new EmbedBuilder()
          .setColor('#2a9454')
          .setDescription(`✅ | Chế độ bảo mật của danh sách phát **${data.name.toUpperCase()}** đã được thay đổi thành **RIÊNG TƯ**`),
        ]});
      };
    } else if(options.getSubcommand() === "remove") {
      const queueId = options.getString('playlist-id');
      const position = options.getInteger('song-position');
      const data = await Playlist.findOne({ _id: queueId }).catch(() => {
        return interaction.reply({ content: 'Danh sách phát này không tồn tại.' });
      });
      if(data.userId !== user.id) return interaction.reply({ 
        content: 'Bạn chỉ có thể xóa các bài hát khỏi danh sách phát của riêng mình.'
      });
      
      const name = data.songs.name;
      const url = data.songs.url;
      
      const filtered = parseInt(position -1);
      if(filtered > name.length - 1) return interaction.reply({
        content: 'Cung cấp vị trí bài hát hợp lệ, sử dụng `/playlist info` để kiểm tra tất cả các vị trí bài hát'
      });

      const opName = name.splice(filtered, 1).filter((x) => !name.includes(x));
      const opURL = url.splice(filtered, 1).filter((x) => !url.includes(x));
      
      await data.save();
      
      return interaction.reply({ embeds: [new EmbedBuilder()
        .setColor('#2a9454')
        .setDescription(`✅ | Đã xóa thành công **[${opName}](${opURL})** khỏi Danh sách phát`)
      ]});
    };
  },
};