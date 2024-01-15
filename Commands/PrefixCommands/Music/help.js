const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { readdirSync } = require('fs');
const config = require(`${process.cwd()}/config.json`);
const { commandBuilders } = require(`${process.cwd()}/Events/functions`);
const path = require("node:path");

const commands = new commandBuilders({
  name: path.parse(__filename).name, // Tên Lệnh chính
  usage: path.parse(__filename).name, // Cách sử dụng khi dùng lệnh help.
  category: path.parse(__dirname).name, // thể loại lệnh
  aliases: ["cmd", "h"], // lệnh phụ
  description: "Hiển thị danh sách lệnh", // mô tả dành cho lệnh
  cooldown: 5, // thời gian hồi lệnh
  owner: false, // bật tắt chế độ dev
  permissions: [] // quyền hạn khi sử dụng lệnh
}).addCommand((client, message, args, prefix) => {
  const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Invite").setURL(config.discordBot).setStyle(ButtonStyle.Link));
      const imageUrl = "https://cdn.discordapp.com/attachments/765620139126554644/826026547746963506/image0.gif";
      if(!args[0]) {
            const categories = readdirSync("./Commands/PrefixCommands/");
            const embed = new EmbedBuilder()
            .setAuthor({ name: `${message.guild.members.me.displayName} Help Command!`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setColor("Random")
            .setImage(imageUrl)
            .setDescription(`Xin chào **${message.author}**, tôi là **${client.user.username}**. Bot âm nhạc discord chất lượng. Hỗ trợ Youtube, Spotify, SoundCloud, Apple Music & các loại khác. Tìm hiểu những gì tôi có thể làm bằng menu chọn.`)
            .setFooter({ text: `© ${client.user.username} | Tất Cả Commands: ${client.commands.size}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
            const row = new ActionRowBuilder().addComponents([
              new StringSelectMenuBuilder()
              .setCustomId("help-category")
              .setPlaceholder(`Chọn Menu Danh mục Lệnh`)
              .setMaxValues(1)
              .setMinValues(1)
              .setOptions(categories.map((category) => {
                return new StringSelectMenuOptionBuilder().setLabel(category).setValue(category);
              })),
            ]);

            message.reply({ embeds: [embed], components: [row, row2] }).then(async(msg) => {
                let collector = await msg.createMessageComponentCollector({
                    filter: (i) => i.isStringSelectMenu() && i.user && i.message.author.id == client.user.id,
                    time: 90000,
                });
                collector.on("collect", async(m) => {
                    if (m.isStringSelectMenu()) {
                        if (m.customId === "help-category") {
                            await m.deferUpdate();
                            let [directory] = m.values;
                            const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: `${message.guild.members.me.displayName} Help Command!`,
                                    iconURL: message.guild.iconURL({ dynamic: true }),
                                })
                                .setDescription(`Đây là tất cả các lệnh có sẵn cho danh mục này để sử dụng. Hãy thử thêm [\`${prefix}\`] trước các lệnh hoặc bạn chỉ cần nhấp vào các lệnh bên dưới.\n\n**❯ ${directory.slice(0, 1).toUpperCase() + directory.slice(1)}:**\n${client.commands.filter((c) => c.category === directory).map((c) => `=> \`${c.name}\` : *${c.description ? c.description : "Không có mô tả"}*`).join("\n")}`)
                                .setColor("Random")
                                .setImage(imageUrl)
                                .setFooter({ text: `© ${client.user.username} | Tất cả Commands: ${client.commands.filter((c) => c.category === directory).size}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                                .setTimestamp();
                            msg.edit({ embeds: [embed] });
                        }
                    }
                });

                collector.on("end", async (collected, reason) => {
                    if(reason === "time") {
                        const timed = new EmbedBuilder()
                            .setAuthor({
                                name: `${message.guild.members.me.displayName} Help Command!`,
                                iconURL: message.guild.iconURL({ dynamic: true }),
                            })
                            .setDescription(`Menu Lệnh Trợ giúp đã hết thời gian chờ, hãy thử sử dụng \`${prefix}help\` để hiển thị lại menu lệnh trợ giúp.`)
                            .setImage(imageUrl)
                            .setColor("Random")
                            .setFooter({
                                text: `© ${client.user.username} | Tất cả Commands: ${client.commands.size}`,
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setTimestamp();
                        msg.edit({ embeds: [timed], components: [row2] });
                    }
                });
            });
      };
   
      /*
        if(!args[0]) {
            const categories = readdirSync(`./Commands/PrefixCommands/`);
            const embed = new EmbedBuilder()
                .setAuthor({ name: `❯ ・ Commands list - ${client.commands.size} Commands`, iconURL: client.user.displayAvatarURL() })
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setColor("Random")
            for (const category of categories) {
                const commands = client.commands.filter((cmd) => cmd.category === category).map((cmd) => `\`${cmd.name}\``).join(", ", "\n");
                embed.addFields({ name: `${(category)} Commands`, value: `> ${commands}`, inline: false });
            };
            return message.channel.send({ embeds: [embed] });
        } else {
            const command = client.commands.get(args[0].toLowerCase()) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase()));
            if(!command) return message.channel.send({ 
               content: "Ồ có vẻ như tôi không có lệnh đó"
            });
            return message.channel.send({ embeds: [new EmbedBuilder()
                .setTitle("Chi tiết lệnh:")
                .setThumbnail('https://hzmi.xyz/assets/images/question_mark.png')
                .addFields({ name: "Tên lệnh:", value: command.name ? `\`${command.name}\`` : "Không có tên cho lệnh này.", inline: true })
                .addFields({ name: "Sử dụng:", value: command.usage ? `\`${command.usage}\`` : `\`${prefix}${command.name}\``, inline: true })
                .addFields({ name: 'Lệnh Phụ', value: command.aliases ? command.aliases.join(", ") : "không có lệnh phụ.", inline: true })
                .addFields({ name: "Mô tả lệnh:", value: command.description ? command.description : "Không có mô tả cho lệnh này.", inline: true })
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setColor("Random")]
            });    
        };
      */
});
// console.log(data.toJSON()); // hiển thị thông tin lệnh ở dạng JSON
module.exports = commands;