const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

const customEvents = () => {
  /*========================================================
  # Chỉnh sửa rút gọn Embeds <Discord.EmbedBuilder>
  ========================================================*/
  const EmbedBuilders = class extends EmbedBuilder {
    constructor({ author, title, colors, fields, images, description, thumbnail, timestamp, footer }) {
      super();
      if(description) this.setDescription(description);
      if(thumbnail) this.setThumbnail(thumbnail);
      if(timestamp) this.setTimestamp(timestamp);
      if(title?.name) this.setTitle(title.name);
      if(title?.url) this.setURL(title.url);
      if(fields) this.addFields(fields);
      if(author) this.setAuthor(author);
      if(footer) this.setFooter(footer);
      if(images) this.setImage(images);
      if(colors) this.setColor(colors);
    };
  };
  /*========================================================
  # rút gọn button
  ========================================================*/
  const addComponents = (...components) => {
    // ActionRowBuilder
    class ActionRowBuilders extends ActionRowBuilder {
      constructor(components) {
        super();
        Array.isArray(components) ? this.addComponents(...components) : this.addComponents([components]);
      };
    };
    // ButtonBuilder
    class ButtonBuilders extends ButtonBuilder {
      constructor(o) {
        super();
        this.setCustomId(o.customId).setLabel(o.label).setStyle(o.style);
        if(o.url) this.setURL(o.url);
        if(o.disabled) this.setDisabled(o.disabled);
        if(o.emoji) this.setEmoji(o.emoji);
      };
    };
    // SelectMenuBuilder
    class SelectMenuBuilders extends StringSelectMenuBuilder {
      constructor(o) {
        super();
        this.setCustomId(o.customId).setOptions(...o.options);
        if(o.disabled) this.setDisabled(o.disabled);
        if(o.maxValues) this.setMaxValues(o.maxValues);
        if(o.minValues) this.setMinValues(o.minValues);
        if(o.placeholder) this.setPlaceholder(o.placeholder);
      };
    };
    // khởi chạy sự kiện
    return components.map((a) => {
      let c;
      if(a.type == "ButtonBuilder") {
        c = a.options.map((p) => new ButtonBuilders(p));
      } else if(a.type == "SelectMenuBuilder") {
        c = new SelectMenuBuilders(a.options);
      } else {
        return console.error("Đã sảy ra lỗi không mong muốn");
      };
      return new ActionRowBuilders(c);
    });
  };
  return { EmbedBuilders, addComponents };
};

module.exports = customEvents;