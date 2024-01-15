const { ButtonStyle, ButtonBuilder } = require("discord.js");

class components {
  /**
   * Một hệ thống mạnh mẽ, hiệu quả nhưng đơn giản để chuyển đổi thời gian con người có thể đọc được thành ms
   * @param str
   * @example className.ms('1h')
   */
  ms(str) {
    let sum = 0, time, type, val;
    // Chuyển chuỗi sang dạng dễ hơn
    str = str.replaceAll('week', 'w').replaceAll('weeks', 'w').replaceAll('day', 'd').replaceAll('days', 'd').replaceAll('hour', 'h').replaceAll('hours', 'h').replaceAll('minute', 'm').replaceAll('minutes', 'm').replaceAll('min', 'm').replaceAll('second', 's').replaceAll('seconds', 's').replaceAll('sec', 's');
    // Tách chuỗi dựa trên các điều khoản
    const arr = ('' + str).split(' ').filter((v) => v != '' && /^(\d{1,}\.)?\d{1,}([wdhms])?$/i.test(v));
    for (let i = 0; i < arr.length; i++) {
      time = arr[i];
      type = time.match(/[wdhms]$/i);
      if (type) {
        val = Number(time.replace(type[0], ''));
        // Chuyển đổi thực tế từ thời gian con người có thể đọc được thành ms
        if (type[0].toLowerCase() === "w") {
          sum += val * 604800000; // tuần
        } else if (type[0].toLowerCase() === "d") {
          sum += val * 86400000; // ngày
        } else if (type[0].toLowerCase() === "h") {
          sum += val * 3600000; // giờ
        } else if (type[0].toLowerCase() === "m") {
          sum += val * 60000; // phút
        } else if (type[0].toLowerCase() === "s") {
          sum += val * 1000; // giây
        };
      } else if (!isNaN(parseFloat(time)) && isFinite(parseFloat(time))) {
        sum += parseFloat(time);
      };
    };
    return sum;
  };
  /**
   * Vô hiệu hóa tất cả các nút trong một hàng
   * @param components
   * @example className.disableButtons(row)
   */
  disableButtons(components) {
    for (let x = 0; x < components.length; x++) {
      for (let y = 0; y < components[x].components.length; y++) {
        // Thực hiện sau đó vào ButtonBuilder
        components[x].components[y] = ButtonBuilder.from(components[x].components[y]);
        // Vô hiệu hóa button
        components[x].components[y].setDisabled(true);
      };
    };
    return components;
  };
  /**
   * Chuyển đổi chuỗi kiểu nút cũ của bạn thành ButtonStyle.
   * @link Documentation: https://discord-api-types.dev/api/discord-api-types-v10/enum/ButtonStyle
   * @param style
   * @example className.toButtonStyle("Primary")
   */
  toButtonStyle(style) {
    // Các tùy chọn kiểu là tùy chọn vì vậy nếu nó không được xác định thì đừng quan tâm
    if (style == undefined) return;
    // Tổ hợp combination
    const combination = [
      { key: 'Secondary', value: ButtonStyle.Secondary },
      { key: 'Primary', value: ButtonStyle.Primary },
      { key: 'Success', value: ButtonStyle.Success },
      { key: 'Danger', value: ButtonStyle.Danger },
      { key: 'Link', value: ButtonStyle.Link }
    ];
    // Sử dụng .find(callback) để lấy combination
    const buttonstyle = combination.find((item) => item.key == style);
    // Nếu nó không tồn tại, chỉ cần trả về không có gì
    if (Number(style) >= 1 && Number(style) <= 5) return Number(style);
    if (!buttonstyle || buttonstyle == undefined) return;
    return buttonstyle.value;
  };
  /**
   * Chuyển đổi mã Hex thành Mảng RGB hoặc Chuỗi RGB. Điều này giúp dễ dàng chuyển đổi từ discord.js v13 sang v14.
   * @param hex
   * @example className.toRgb('#406DBC')
   */
  toRgb(hex) {
    // chia tách nó và phân tích cú pháp số nguyên
    const color1 = parseInt(hex.slice(1, 3), 16);
    const color2 = parseInt(hex.slice(3, 5), 16);
    const color3 = parseInt(hex.slice(5, 7), 16);
    return [color1, color2, color3];
  };
  /** 
   * Permissions
   * @param Discord.permission;
   * @example className.parsePermissions(["pre...."]);
   */
  parsePermissions(perms) {
    const permissions = {
      AddReactions: "Add Reactions",
      Administrator: "Administrator",
      AttachFiles: "Attach files",
      BanMembers: "Ban members",
      ChangeNickname: "Change nickname",
      Connect: "Connect",
      CreateInstantInvite: "Create instant invite",
      CreatePrivateThreads: "Create private threads",
      CreatePublicThreads: "Create public threads",
      DeafenMembers: "Deafen members",
      EmbedLinks: "Embed links",
      KickMembers: "Kick members",
      ManageChannels: "Manage channels",
      ManageEmojisAndStickers: "Manage emojis and stickers",
      ManageEvents: "Manage Events",
      ManageGuild: "Manage server",
      ManageMessages: "Manage messages",
      ManageNicknames: "Manage nicknames",
      ManageRoles: "Manage roles",
      ManageThreads: "Manage Threads",
      ManageWebhooks: "Manage webhooks",
      MentionEveryone: "Mention everyone",
      ModerateMembers: "Moderate Members",
      MoveMembers: "Move members",
      MuteMembers: "Mute members",
      PrioritySpeaker: "Priority speaker",
      ReadMessageHistory: "Read message history",
      RequestToSpeak: "Request to Speak",
      SendMessages: "Send messages",
      SendMessagesInThreads: "Send Messages In Threads",
      SendTTSMessages: "Send TTS messages",
      Speak: "Speak",
      Stream: "Video",
      UseApplicationCommands: "Use Application Commands",
      UseEmbeddedActivities: "Use Embedded Activities",
      UseExternalEmojis: "Use External Emojis",
      UseExternalStickers: "Use External Stickers",
      UseVAD: "Use voice activity",
      ViewAuditLog: "View audit log",
      ViewChannel: "View channel",
      ViewGuildInsights: "View server insights",
    };
    return "`" + perms.map((perm) => permissions[perm]).join(", ") + "` " + "permission";
  };
};

module.exports = components;