const { StringSelectMenuBuilder, EmbedBuilder, PermissionFlagsBits, ComponentType, ActionRowBuilder, ButtonBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require("discord.js");
const addComponents = require("./components");
const customEvents = require("./discord");

class SimplyError extends Error {
  /**
   * Phát ra lỗi và cung cấp đầy đủ chi tiết để giúp người dùng gỡ lỗi dễ dàng
   * @param {String} function
   * @param {String} title
   * @param {String} tip
   */
  constructor(options = { tip: 'BlackCat-Club' }) {
    const msg = `SimplyError - ${options.function} | ${options.title}\n\n${options.tip}`;
    super(msg);
  }
};

function embedCreator(msgOrInt, options = { strict: false }) {
  return new Promise(async (resolve) => {
    try {
      const { EmbedBuilders } = customEvents();
      const misc_1 = new addComponents();
      const done = new ButtonBuilder().setLabel('Hoàn thành').setStyle(misc_1.toButtonStyle("Success")).setCustomId('setDone');
      const reject = new ButtonBuilder().setLabel('Hủy bỏ').setStyle(misc_1.toButtonStyle("Danger")).setCustomId('setDelete');
      const select = new StringSelectMenuBuilder({
        placeholder: 'Embed Creator',
        custom_id: 'embed-creator',
        max_values: 1,
        options: [
          { label: 'Message', description: 'message nằm ngoài nội dung embeds', value: 'setMessage' },
          { label: 'Author', description: 'Đặt một author trong phần embeds', value: 'setAuthor' },
          { label: 'Title', description: 'Đặt tiêu đề trong phần embeds', value: 'setTitle' },
          { label: 'URL', description: 'Đặt URL cho Tiêu đề trong phần embeds', value: 'setURL' },
          { label: 'Description', description: 'Đặt mô tả trong phần embeds', value: 'setDescription' },
          { label: 'Color', description: 'Chọn một màu của embeds', value: 'setColor' },
          { label: 'Image', description: 'Đặt hình ảnh của embeds', value: 'setImage' },
          { label: 'Thumbnail', description: 'Đặt hình ảnh thu nhỏ của embeds', value: 'setThumbnail' },
          { label: 'Field', description: 'Thêm Field cho embeds', value: 'addField' },
          { label: 'Footer', description: 'Đặt chân trang của embeds', value: 'setFooter' },
          { label: 'Timestamp', description: 'Bật Dấu thời gian của embed', value: 'setTimestamp' }
        ],
      });
      const row = new ActionRowBuilder({ components: [done, reject] });
      const selectRow = new ActionRowBuilder({ components: [select] });
      const embed = new EmbedBuilders({
        description: 'Chọn bất kỳ tùy chọn nào từ Menu trong thư này để tạo embed tùy chỉnh cho bạn.\n\nHãy lấy hình ảnh dưới đây làm tham chiếu.',
        title: { name: 'Embed Generator' },
        images: "https://i.postimg.cc/sXS767Gd/image.png",
        colors: (0, misc_1.toRgb)('#406DBC'),
        footer: { text: '©️ BlackCat-Club', iconURL: 'https://i.imgur.com/XFUIwPh.png' }
      });
      let interaction;
      if (msgOrInt.commandId) {
        interaction = msgOrInt;
        if (!interaction.deferred) await interaction.deferReply({ fetchReply: true });
      };
      let msg;
      const extInteraction = msgOrInt, extMessage = msgOrInt;
      if (interaction) {
        msg = await extInteraction.followUp({ embeds: [embed], components: [selectRow, row], fetchReply: true });
      } else if (!interaction) {
        msg = await extMessage.reply({ embeds: [embed], components: [selectRow, row] });
      };
      const creator = new EmbedBuilder({
        footer: { text: '©️ Rahuletto. npm i simply-djs', iconURL: 'https://i.imgur.com/XFUIwPh.png' },
        colors: (0, misc_1.toRgb)('#2F3136'),
      });
      msgOrInt.channel.send({ content: '** **', embeds: [creator] }).then(async (preview) => {
        const messageFilter = (mess) => msgOrInt.member.user.id === mess.author.id;
        const buttonFilter = (mess) => {
          if (mess.user.id === msgOrInt.member.user.id) return true;
          mess.reply({ content: `Chỉ <@!${msgOrInt.member.user.id}> có thể sử dụng các button này!`, ephemeral: true });
          return false;
        };
        const filter = (mess) => {
          if (mess.user.id === msgOrInt.member.user.id) return true;
          mess.reply({ content: `Chỉ <@!${msgOrInt.member.user.id}> mới có thể sử dụng các button này!`, ephemeral: true });
          return false;
        };
        const collector = msg.createMessageComponentCollector({
          filter: filter,
          componentType: ComponentType.StringSelect,
          idle: (0, misc_1.ms)('5m')
        });
        const buttonCltr = msg.createMessageComponentCollector({
          filter: filter,
          componentType: ComponentType.Button,
          idle: (0, misc_1.ms)('5m')
        });
        buttonCltr.on('collect', async (button) => {
          if (button.customId === 'setDelete') {
            await button.reply({ content: 'Đang xóa yêu cầu của bạn.', ephemeral: true });
            preview.delete().catch(() => { });
            msg.delete().catch(() => { });
          } else if (button.customId === 'setDone') {
            if (msgOrInt.member.permissions.has(PermissionFlagsBits.Administrator)) {
              await button.reply({ content: 'Cung cấp cho tôi một kênh để gửi bản embeds.', ephemeral: true });
              const msgCollector = button.channel.createMessageCollector({
                filter: messageFilter,
                time: (0, misc_1.ms)('1m'),
                max: 1
              });
              msgCollector.on('collect', async (m) => {
                if (m.mentions.channels.first()) {
                  const ch = m.mentions.channels.first();
                  await button.editReply({ content: 'Xong 👍' });
                  ch.send({ content: preview.content, embeds: [preview.embeds[0]] });
                  preview.delete().catch(() => { });
                  msg.delete().catch(() => { });
                  m.delete().catch(() => { });
                  resolve(preview.embeds[0].toJSON());
                };
              });
            } else if (!msgOrInt.member.permissions.has(PermissionFlagsBits.Administrator)) {
              await button.reply({ content: 'Xong 👍', ephemeral: true });
              msgOrInt.channel.send({ content: preview.content, embeds: [preview.embeds[0]] });
              preview.delete().catch(() => { });
              msg.delete().catch(() => { });
              resolve(preview.embeds[0].toJSON());
            };
          };
        });
        collector.on('collect', async (select) => {
          if (select.values[0] === 'setTimestamp') {
            const btn = new ButtonBuilder({ label: "Bật", custom_id: "timestamp-yes", style: misc_1.toButtonStyle("Primary") });
            const btn2 = new ButtonBuilder({ label: "Tắt", custom_id: 'timestamp-no', style: misc_1.toButtonStyle("Danger") });
            await select.reply({
              content: 'Bạn có muốn có bật dấu thời gian trong phần embed không ?',
              ephemeral: true,
              components: [new ActionRowBuilder({ components: [btn, btn2] })]
            });
            const buttonCollector = select.channel.createMessageComponentCollector({
              componentType: discord_js_1.ComponentType.Button,
              filter: buttonFilter,
              idle: (0, misc_1.ms)('1m')
            });
            buttonCollector.on('collect', async (button) => {
              if (button.customId === 'timestamp-yes') {
                await select.editReply({ components: [], content: 'Đã bật thời gian cho embeds' });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setTimestamp(new Date())]
                }).catch(() => { });
              };
              if (button.customId === 'timestamp-no') {
                await select.editReply({ components: [], content: 'Đã tắt Dấu thời gian của embed' });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setTimestamp(null)]
                }).catch(() => { });
              };
            });
          } else if (select.values[0] === 'setAuthor') {
            const authorSelect = new StringSelectMenuBuilder({
              custom_id: 'author-select',
              placeholder: 'Author Options',
              max_values: 1,
              options: [
                { label: 'Author text', description: 'Đặt văn bản trong author', value: 'author-text' },
                { label: 'Author icon', description: 'Đặt biểu tượng trong author', value: 'author-icon' },
                { label: 'Author URL', description: 'Đặt url trong author', value: 'author-url' }
              ],
            });
            await select.reply({
              content: 'Chọn một từ các tùy chọn "Author"',
              ephemeral: true,
              components: [new ActionRowBuilder({ components: [authorSelect] })]
            });
            const menuCollector = select.channel.createMessageComponentCollector({
              componentType: ComponentType.StringSelect,
              filter: filter,
              idle: (0, misc_1.ms)('1m')
            });
            menuCollector.on('collect', async (menu) => {
              if (menu.customId !== 'author-select') return;
              if (menu.values[0] === 'author-text') {
                const name = new TextInputBuilder({
                  custom_id: 'author',
                  label: "Thêm văn bản author",
                  style: TextInputStyle.Short,
                  required: false
                });
                const modalRow = new ActionRowBuilder({ components: [name] });
                const modal = new ModalBuilder().setCustomId('author-text-modal').setTitle('Author text').addComponents(modalRow);
                await menu.showModal(modal);
                const submitted = await menu.awaitModalSubmit({
                  time: (0, misc_1.ms)('1m'),
                  filter: (i) => i.user.id === menu.user.id
                });
                if (submitted) {
                  const author = submitted.fields.getTextInputValue('author');
                  if (author.toLowerCase() === 'cancel') {
                    await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
                  } else {
                    await submitted.reply({ content: `Xong! Đặt văn bản author trong phần embed của bạn`, ephemeral: true });
                    preview.edit({
                      content: preview.content,
                      embeds: [EmbedBuilders.from(preview.embeds[0]).setAuthor({
                        name: author,
                        iconURL: preview.embeds[0].author?.iconURL ? preview.embeds[0].author?.iconURL : null,
                        url: preview.embeds[0].author?.url ? preview.embeds[0].author?.url : null
                      })]
                    }).catch(() => { });
                  }
                }
              } else if (menu.values[0] === 'author-icon') {
                await menu.reply({ content: 'Gửi cho tôi hình ảnh author (Attachment/Image URL)', ephemeral: true, components: [] });
                const messageCollect = select.channel.createMessageCollector({
                  filter: messageFilter,
                  time: (0, misc_1.ms)('1m'),
                  max: 1
                });
                messageCollect.on('collect', async (m) => {
                  const isthumb = m.content.match(/(http[s]*:\/\/)([a-z\-_0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-_\/._~:?#\[\]@!$&'()*+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png)/i) != null ||
                    m.attachments.first()?.url || null;
                  if (!isthumb) return menu.followUp({ content: 'Đây không phải là URL hình ảnh/Đính kèm hình ảnh. Vui lòng cung cấp một hình ảnh hợp lệ.', ephemeral: true });
                  menuCollector.stop();
                  m.delete().catch(() => { });
                  preview.edit({
                    content: preview.content,
                    embeds: [EmbedBuilders.from(preview.embeds[0]).setAuthor({
                      name: preview.embeds[0].author?.name ? preview.embeds[0].author?.name : null,
                      iconURL: m.content || m.attachments.first()?.url || null,
                      url: preview.embeds[0].author?.url ? preview.embeds[0].author?.url : null
                    })]
                  }).catch(() => { });
                });
              } else if (menu.values[0] === 'author-url') {
                const name = new TextInputBuilder()
                  .setLabel('Author: gửi cho tôi url liên kết')
                  .setCustomId('link')
                  .setStyle(TextInputStyle.Short)
                  .setRequired(false);
                const modalRow = new ActionRowBuilder({ components: [name] });
                const modal = new ModalBuilder().setCustomId('author-url-modal').setTitle('Author link URL').addComponents(modalRow);
                await menu.showModal(modal);
                const submitted = await menu.awaitModalSubmit({
                  time: (0, misc_1.ms)('1m'),
                  filter: (i) => i.user.id === menu.user.id
                });
                if (submitted) {
                  const link = submitted.fields.getTextInputValue('link');
                  if (link.toLowerCase() === 'cancel') {
                    return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
                  } else if (!link.startsWith('http')) {
                    return await submitted.reply({ content: 'Một URL phải bắt đầu bằng giao thức http/https. Vui lòng cung cấp một URL hợp lệ.', ephemeral: true });
                  } else {
                    await submitted.reply({ content: "Xong! Đặt liên kết url trong phần author embeds của bạn", ephemeral: true });
                    preview.edit({
                      content: preview.content,
                      embeds: [EmbedBuilders.from(preview.embeds[0]).setAuthor({
                        name: preview.embeds[0].author?.name ? preview.embeds[0].author?.name : null,
                        iconURL: preview.embeds[0].author?.iconURL ? preview.embeds[0].author?.iconURL : null,
                        url: link || null
                      })]
                    }).catch(() => { });
                  };
                };
              };
            });
          } else if (select.values[0] === 'setMessage') {
            const message = new TextInputBuilder()
              .setLabel('Gửi cho tôi tin nhắn để thiết lập')
              .setCustomId('message')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false);
            const modalRow = new ActionRowBuilder({ components: [message] });
            const modal = new ModalBuilder().setCustomId('set-message').setTitle('Set Message').addComponents(modalRow);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              time: (0, misc_1.ms)('1m'),
              filter: (i) => i.user.id === select.user.id
            });
            if (submitted) {
              const message = submitted.fields.getTextInputValue('message');
              if (message.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else {
                await submitted.reply({ content: `Xong! đã đặt nội dung bên ngoài embed`, ephemeral: true });
                preview.edit({ content: message, embeds: [preview.embeds[0]] }).catch(() => { });
              };
            };
          } else if (select.values[0] === 'setThumbnail') {
            await select.reply({ content: 'Gửi cho tôi một hình ảnh cho hình thu nhỏ (hình ảnh nhỏ ở trên cùng bên phải)', ephemeral: true });
            const messageCollect = select.channel.createMessageCollector({
              filter: messageFilter,
              time: (0, misc_1.ms)('1m'),
              max: 1
            });
            messageCollect.on('collect', async (m) => {
              const isthumb = m.content.match(/(http[s]*:\/\/)([a-z\-_0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-_\/._~:?#\[\]@!$&'()*+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png)/i) != null || m.attachments.first()?.url || null;
              if (!isthumb) return select.followUp({ content: 'Đây không phải là một url hình ảnh. Vui lòng cung cấp url hình ảnh hoặc tệp đính kèm.', ephemeral: true });
              messageCollect.stop();
              m.delete().catch(() => { });
              preview.edit({
                content: preview.content,
                embeds: [EmbedBuilders.from(preview.embeds[0]).setThumbnail(m.content || m.attachments.first()?.url || null)]
              }).catch(() => { });
            });
          } else if (select.values[0] === 'setColor') {
            const color = new TextInputBuilder().setLabel('Gửi cho tôi mã hex để thiết lập').setCustomId('color').setStyle(TextInputStyle.Short).setRequired(false);
            const modalRow = new ActionRowBuilder({ components: [color] });
            const modal = new ModalBuilder().setCustomId('set-color').setTitle('Set Color').addComponents(modalRow);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              time: (0, misc_1.ms)('1m'),
              filter: (i) => i.user.id === select.user.id
            });
            if (submitted) {
              const hex = submitted.fields.getTextInputValue('color');
              if (hex.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else if (/^#[0-9A-F]{6}$/i.test(hex)) {
                return preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setColor((0, misc_1.toRgb)(hex))]
                }).then(async () => {
                  await submitted.reply({ content: `Xong! Đặt màu của embeds`, ephemeral: true });
                }).catch(async () => {
                  await submitted.reply({ content: `Vui lòng cung cấp mã hex hợp lệ`, ephemeral: true });
                });
              } else return await submitted.reply({
                content: `Cung cấp mã hex hợp lệ với \`#\` (Ví dụ: #406DBC)`,
                ephemeral: true
              });
            };
          } else if (select.values[0] === 'setURL') {
            const url = new TextInputBuilder()
              .setLabel('Gửi cho tôi URL để đặt làm liên kết')
              .setCustomId('url')
              .setStyle(TextInputStyle.Short)
              .setRequired(false);
            const modalRow = new ActionRowBuilder().setComponents([url]);
            const modal = new ModalBuilder().setCustomId('set-url').setTitle('Set URL').addComponents(modalRow);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              time: (0, misc_1.ms)('1m'),
              filter: (i) => i.user.id === select.user.id
            });
            if (submitted) {
              const url = submitted.fields.getTextInputValue('url');
              if (url.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else if (!url.startsWith('http')) {
                return await submitted.reply({ content: `Một URL phải bắt đầu bằng giao thức http. Vui lòng cung cấp một URL hợp lệ.`, ephemeral: true });
              } else {
                await submitted.reply({ content: `Xong! Đã đặt liên kết url trong embeds`, ephemeral: true });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setURL(url)]
                }).catch(() => { });
              };
            };
          } else if (select.values[0] == 'addField') {
            const name = new TextInputBuilder().setLabel('Gửi cho tôi tên field').setCustomId('field-name').setStyle(TextInputStyle.Short).setRequired(true);
            const value = new TextInputBuilder().setLabel('Gửi cho tôi giá trị field').setCustomId('field-value').setStyle(TextInputStyle.Short).setRequired(true);
            const title = new ActionRowBuilder().setComponents([name]);
            const val = new ActionRowBuilder().setComponents([value]);
            const modal = new ModalBuilder().setCustomId('add-field').setTitle('Add field').addComponents(title, val);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              filter: (i) => i.user.id === select.user.id,
              time: (0, misc_1.ms)('1m')
            });
            if (submitted) {
              const fieldName = submitted.fields.getTextInputValue('field-name');
              const fieldValue = submitted.fields.getTextInputValue('field-value');
              if (fieldName.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else {
                await submitted.reply({ content: `Xong! Đã thêm field trong embeds`, ephemeral: true });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).addFields({
                    name: fieldName,
                    value: fieldValue
                  })]
                }).catch(() => { });
              };
            };
          } else if (select.values[0] === 'setImage') {
            await select.reply({ content: 'Gửi cho tôi hình ảnh bạn cần thêm vào embeds', ephemeral: true });
            const messageCollect = select.channel.createMessageCollector({
              filter: messageFilter,
              time: (0, misc_1.ms)('1m'),
              max: 1
            });
            messageCollect.on('collect', async (m) => {
              const isthumb = m.content.match(/(http[s]*:\/\/)([a-z\-_0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-_\/._~:?#\[\]@!$&'()*+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png)/i) != null || m.attachments.first()?.url || null;
              if (!isthumb) return await select.followUp('Đó không phải là url hình ảnh/tệp đính kèm hình ảnh. Vui lòng cung cấp cho tôi url hình ảnh hoặc tệp đính kèm.');
              m.delete().catch(() => { });
              messageCollect.stop();
              preview.edit({
                content: preview.content,
                embeds: [EmbedBuilders.from(preview.embeds[0]).setImage(m.content || m.attachments.first()?.url)]
              }).catch(() => { });
            });
          } else if (select.values[0] === 'setTitle') {
            const title = new TextInputBuilder().setLabel('Gửi cho tôi tiêu đề để đặt trong embeds').setCustomId('title').setStyle(TextInputStyle.Short).setRequired(false);
            const modalRow = new ActionRowBuilder().setComponents([title]);
            const modal = new ModalBuilder().setCustomId('set-title').setTitle('Đặt tiêu đề').addComponents(modalRow);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              time: (0, misc_1.ms)('1m'),
              filter: (i) => i.user.id === select.user.id
            });
            if (submitted) {
              const title = submitted.fields.getTextInputValue('title');
              if (title.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else {
                await submitted.reply({ content: `Xong ! Đã đặt tiêu đề trong embeds`, ephemeral: true });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setTitle(title)]
                }).catch(() => { });
              };
            };
          } else if (select.values[0] === 'setDescription') {
            const description = new TextInputBuilder().setLabel('Gửi cho tôi mô tả để thiết lập embed').setCustomId('description').setStyle(TextInputStyle.Paragraph).setRequired(false);
            const modalRow = new ActionRowBuilder().setComponents([description]);
            const modal = new ModalBuilder().setCustomId('set-description').setTitle('Set Description').addComponents(modalRow);
            await select.showModal(modal);
            const submitted = await select.awaitModalSubmit({
              time: (0, misc_1.ms)('1m'),
              filter: (i) => i.user.id === select.user.id
            });
            if (submitted) {
              const description = submitted.fields.getTextInputValue('description');
              if (description.toLowerCase() === 'cancel') {
                return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
              } else {
                await submitted.reply({ content: `Xong! Đã đặt mô tả trong embed`, ephemeral: true });
                preview.edit({
                  content: preview.content,
                  embeds: [EmbedBuilders.from(preview.embeds[0]).setDescription(description)]
                }).catch(() => { });
              };
            };
          } else if (select.values[0] === 'setFooter') {
            const footerSelect = new StringSelectMenuBuilder()
              .setMaxValues(1)
              .setCustomId('footer-select')
              .setPlaceholder('Footer Options')
              .addOptions([
                { label: 'Footer text', description: 'Đặt văn bản footer', value: 'footer-text' },
                { label: 'Footer icon', description: 'Đặt biểu tượng footer', value: 'footer-icon' }
              ]);
            await select.reply({
              content: 'Chọn một từ các tùy chọn "Footer"',
              ephemeral: true,
              components: [new ActionRowBuilder().addComponents([footerSelect])]
            });
            const menuCollector = select.channel.createMessageComponentCollector({
              componentType: discord_js_1.ComponentType.StringSelect,
              filter: filter,
              idle: (0, misc_1.ms)('1m')
            });
            menuCollector.on('collect', async (menu) => {
              if (menu.customId !== 'footer-select') return;
              if (menu.values[0] === 'footer-text') {
                const footerText = new TextInputBuilder().setLabel('Gửi cho tôi văn bản Footer').setCustomId('footer-text').setStyle(TextInputStyle.Short).setRequired(false);
                const modalRow = new ActionRowBuilder().setComponents([footerText]);
                const modal = new ModalBuilder().setCustomId('set-footer').setTitle('Đặt văn bản footer').addComponents(modalRow);
                await menu.showModal(modal);
                const submitted = await menu.awaitModalSubmit({
                  time: (0, misc_1.ms)('1m'),
                  filter: (i) => i.user.id === menu.user.id
                });
                if (submitted) {
                  const footerText = submitted.fields.getTextInputValue('footer-text');
                  if (footerText.toLowerCase() === 'cancel') {
                    return await submitted.reply({ content: `Bạn đã hủy.`, ephemeral: true });
                  } else {
                    await submitted.reply({ content: `Xong! Đã đặt văn bản footer trong embed`, ephemeral: true });
                    preview.edit({
                      content: preview.content,
                      embeds: [EmbedBuilders.from(preview.embeds[0]).setFooter({
                        text: footerText,
                        iconURL: preview.embeds[0].footer?.iconURL ? preview.embeds[0].footer?.iconURL : null
                      })]
                    }).catch(() => { });
                  };
                };
              };
              if (menu.values[0] === 'footer-icon') {
                await menu.reply({ content: 'Gửi cho tôi biểu tượng Footer (Attachment/Image URL)', ephemeral: true, components: [] });
                const messageCollect = select.channel.createMessageCollector({
                  filter: messageFilter,
                  time: (0, misc_1.ms)('1m'),
                  max: 1
                });
                messageCollect.on('collect', async (m) => {
                  const isthumb = m.content.match(/(http[s]*:\/\/)([a-z\-_0-9\/.]+)\.([a-z.]{2,3})\/([a-z0-9\-_\/._~:?#\[\]@!$&'()*+,;=%]*)([a-z0-9]+\.)(jpg|jpeg|png)/i) != null || m.attachments.first()?.url || null;
                  if (!isthumb) return menu.followUp({
                    content: 'Đây không phải là URL hình ảnh/Đính kèm hình ảnh. Vui lòng cung cấp một hình ảnh hợp lệ.',
                    ephemeral: true
                  });
                  menuCollector.stop();
                  m.delete().catch(() => { });
                  preview.edit({
                    content: preview.content,
                    embeds: [EmbedBuilder.from(preview.embeds[0]).setFooter({
                      text: preview.embeds[0].footer?.text || null,
                      iconURL: m.content || m.attachments.first()?.url || null
                    })]
                  }).catch(() => { });
                });
              };
            });
          };
        });
        collector.on('end', async (_collected, reason) => {
          if (reason === 'time') {
            const content = new ButtonBuilder()
              .setLabel('Timed Out')
              .setStyle(misc_1.toButtonStyle("Danger"))
              .setCustomId('timeout-embedcreator')
              .setDisabled(true);
            const row = new ActionRowBuilder({ components: [content] });
            await msg.edit({ embeds: [msg.embeds[0]], components: [row] });
          };
        });
      });
    } catch (err) {
      if (options?.strict) {
        throw new SimplyError({
          function: 'embedCreator',
          title: 'Đã xảy ra lỗi khi chạy chức năng ',
          tip: err.stack
        });
      } else return console.log(`embedCreator | Error: ${err.stack}`);
    };
  });
};

module.exports = embedCreator;