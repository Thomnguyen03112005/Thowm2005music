const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ApplicationCommandOptionType, ChannelType, ButtonStyle, TextInputStyle, ComponentType } = require("discord.js");
/*========================================================
# events disableButtons
========================================================*/
function disableButtons(components) {
  for (let x = 0; x < components.length; x++) {
    for (let y = 0; y < components[x].components.length; y++) {
      components[x].components[y].disabled = true;
    };
  };
  return components;
};
/*========================================================
# RPS
========================================================*/
const RPSGame = class {
  constructor(options = {}) {
      // cái này sẽ được sử dụng khi trong commands không có các giá trị đối 
      // các đối số và giá trị của: mention, messageCreate, interactionCreate
      if (!options.message) throw new TypeError('KHÔNG CÓ TIN NHẮN: Vui lòng cung cấp đối số thông báo')
      if(!options.opponent) throw new TypeError('KHÔNG CÓ ĐỐI THỦ: Vui lòng cung cấp đối số của đối thủ')
      if (!options.slashCommand) options.slashCommand = false;
      // tiêu đề, miêu tả, màu của embeds
      if (!options.embed) options.embed = {};
      if (!options.embed.title) options.embed.title = 'Oẳn tù tì';
      if (!options.embed.description) options.embed.description = 'Nhấn nút bên dưới để lựa chọn!';
      if (!options.embed.color) options.embed.color = '#5865F2';
      // chữ của các button lựa chọn
      if (!options.buttons) options.buttons = {};
      if (!options.buttons.rock) options.buttons.rock = 'Đá';
      if (!options.buttons.paper) options.buttons.paper = 'Bao';
      if (!options.buttons.scissors) options.buttons.scissors = 'Kéo';
      // các emoji tùy chỉnh của game
      if (!options.emojis) options.emojis = {};
      if (!options.emojis.rock) options.emojis.rock = '🌑';
      if (!options.emojis.paper) options.emojis.paper = '📃';
      if (!options.emojis.scissors) options.emojis.scissors = '✂️';
      // đến đây lười conment vl tự ngẫm nhé
      if (!options.askMessage) options.askMessage = 'Đây {đối thủ}, {người thách thức} đã thách thức bạn trò chơi oẳn tù tì!';
      if (!options.cancelMessage) options.cancelMessage = 'Hình như họ từ chối chơi trò oẳn tù tì. \:(';
      if (!options.timeEndMessage) options.timeEndMessage = 'Vì đối thủ không trả lời, tôi đã bỏ trò chơi!';
      //
      if (!options.othersMessage) options.othersMessage = 'Bạn không được phép sử dụng các nút cho tin nhắn này!';
      if (!options.chooseMessage) options.chooseMessage = 'bạn chọn {emoji}!';     
      if (!options.noChangeMessage) options.noChangeMessage = 'Bạn không thể thay đổi lựa chọn của mình!';
      //
      if (!options.gameEndMessage) options.gameEndMessage = 'Trò chơi chưa hoàn thành :(';
      if (!options.winMessage) options.winMessage = '{winner} thắng trận đấu!';
      if (!options.drawMessage) options.drawMessage = 'Đó là một trận hòa!';
      // các giá trị mặc định (ông có thể thay đổi nếu thích)
      this.inGame = false;
      this.options = options;
      this.opponent = options.opponent;
      this.message = options.message;
  }
  
  sendMessage(content) {
      if(this.options.slashCommand) {
        return this.message.editReply(content);
      } else return this.message.channel.send(content);
  }

  async startGame() {
      if(this.options.slashCommand) {
        if(!this.message.deferred) await this.message.deferReply({ ephemeral: false });
        this.message.author = this.message.user;
      };
      if(this.opponent.bot) return this.sendMessage('Bạn không thể chơi với bot!');
      if(this.opponent.id === this.message.author.id) return this.sendMessage('Bạn không thể chơi với chính mình!');
      function verify(options) {
        return new Promise(async(res, rej) => {
          const message = options.message;
    	    const opponent = options.opponent;
          const askEmbed = new EmbedBuilder({
            title: options.embed.askTitle || options.embed.title,
            description: options.askMessage.replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString()),
          });
          askEmbed.setColor(options.colors?.green || options.embed.color);
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel(options.buttons?.accept || 'Chấp nhận').setStyle('Success').setCustomId('accept'),
            new ButtonBuilder().setLabel(options.buttons?.reject || 'Từ chối').setStyle('Danger').setCustomId('reject')
          );
    	    let askMsg;
          if(options.slashCommand) {
            // được gởi nếu như sử dụng lệnh slash 
            askMsg = await message.editReply({
               embeds: [askEmbed],
               components: [row] 
           });
           // nếu không sẽ được gởi theo messageCreate 
          } else askMsg = await message.channel.send({
              embeds: [askEmbed], 
              components: [row]
          });
    
          const filter = (interaction) => interaction === interaction;
          const interaction = askMsg.createMessageComponentCollector({
            filter, time: 30000
          });
       
          await interaction?.on('collect', async (btn) => {
            if (btn.user.id !== opponent.id) return btn.reply({ 
              content: options.othersMessage.replace('{author}', opponent.tag), 
              ephemeral: true 
            });
            await btn.deferUpdate();
            interaction?.stop(btn.customId);
          });
    
          await interaction?.on('end', (_, r) => {
              if (r === 'accept') {
                if (!options.slashCommand) askMsg.delete().catch();
                return res(true)
              };
              const cancelEmbed = new EmbedBuilder()
              .setTitle(options.embed.cancelTitle || options.embed.title)
              .setDescription(options.cancelMessage.replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString()))
              .setColor(options.colors?.red || options.embed.color)
              if(r === 'time') {
                cancelEmbed.setDescription(options.timeEndMessage.replace('{challenger}', message.author.toString()).replace('{opponent}', opponent.toString()))
              };
              res(false);
              return askMsg.edit({ embeds: [cancelEmbed], components: disableButtons(askMsg.components) });
          });
        });
      };
      if(await verify(this.options)) {
        this.RPSGame();
      };
  }

  async RPSGame() {
      this.inGame = true;
      const emojis = this.options.emojis;
      const choice = { r: emojis.rock, p: emojis.paper, s: emojis.scissors };
      const msg = await this.sendMessage({ 
        embeds: [new EmbedBuilder()
          .setTitle(this.options.embed.title)
          .setDescription(this.options.embed.description)
          .setColor(this.options.embed.color)
        ], components: [new ActionRowBuilder().addComponents(
           new ButtonBuilder().setCustomId('r_rps').setStyle('Primary').setLabel(this.options.buttons.rock).setEmoji(emojis.rock),
           new ButtonBuilder().setCustomId('p_rps').setStyle('Primary').setLabel(this.options.buttons.paper).setEmoji(emojis.paper),
           new ButtonBuilder().setCustomId('s_rps').setStyle('Primary').setLabel(this.options.buttons.scissors).setEmoji(emojis.scissors)
        )],
      });
      let challengerChoice; // sự lựa chọn thách thức
      let opponentChoice; // lựa chọn đối thủ
      const filter = m => m;
      const collector = msg.createMessageComponentCollector({
          filter,
          time: 60000,
      });
      collector.on('collect', async btn => {
          if(btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) return btn.reply({ 
            content: this.options.othersMessage.replace('{author}', this.message.author.tag + 'Và' + this.opponent.tag), 
            ephemeral: true
          });       

          if(btn.user.id == this.message.author.id) {
              if(challengerChoice) return btn.reply({ 
                content: this.options.noChangeMessage, 
                ephemeral: true
              });
              challengerChoice = choice[btn.customId.split('_')[0]];
              btn.reply({ content: this.options.chooseMessage.replace('{emoji}', challengerChoice),  ephemeral: true })
              if(challengerChoice && opponentChoice) {
                  collector.stop();
                  this.getResult(msg, challengerChoice, opponentChoice);
              };
          } else if(btn.user.id == this.opponent.id) {
              if(opponentChoice) return btn.reply({ 
                content: this.options.noChangeMessage, 
                ephemeral: true
              });
              opponentChoice = choice[btn.customId.split('_')[0]];
              btn.reply({ content: this.options.chooseMessage.replace('{emoji}', opponentChoice),  ephemeral: true });
              if (challengerChoice && opponentChoice) {
                  collector.stop()
                  this.getResult(msg, challengerChoice, opponentChoice)
              };
          };
      });

      collector.on('end', async(c,r) => {
        if(r === 'time' && this.inGame == true) return msg.edit({ 
          embeds: [new EmbedBuilder()
            .setTitle(this.options.embed.title)
            .setColor(this.options.embed.color)
            .setDescription(this.options.gameEndMessage)
            .setTimestamp()], 
          components: disableButtons(msg.components) 
        });
      });
  }

  getResult(msg, challenger, opponent) {
      let result;
      const { rock, paper, scissors } = this.options.emojis;
      if (challenger === opponent) {
          result = this.options.drawMessage;
      } else if((opponent === scissors && challenger === paper) || (opponent === rock && challenger === scissors) ||  (opponent === paper && challenger === rock)) {
          result = this.options.winMessage.replace('{winner}', this.opponent.toString())
      } else {
          result = this.options.winMessage.replace('{winner}', this.message.author.toString())
      };
      return msg.edit({ embeds: [new EmbedBuilder()
        .setTitle(this.options.embed.title)
        .setColor(this.options.embed.color)
        .setDescription(result)
        .addFields({ name: this.message.author.username, value: challenger, inline: true })
        .addFields({ name: this.opponent.username, value: opponent, inline: true })
        .setTimestamp()], components: disableButtons(msg.components) 
      });
  };
};
/*========================================================
# slots game
========================================================*/
const Slots = class {
  constructor(client, options = {}) {
    if(!options.isSlashGame) options.isSlashGame = false;
    if(!options.message) throw new TypeError('NO_MESSAGE: Không có tùy chọn tin nhắn nào được cung cấp.');
    if(!options.embed) options.embed = {};
    if(!options.embed.title) options.embed.title = 'Slot Machine';
    if(!options.embed.color) options.embed.color = '#5865F2';
    if(!options.slots) options.slots = ['🍇', '🍊', '🍋', '🍌'];
    if(!Array.isArray(options.slots)) throw new TypeError('INVALID_SLOTS: tùy chọn vị trí phải là một mảng.');
    this.client = client;
    this.options = options;
    this.money = options.moneyNumber || 5000;
    this.message = options.message;
    this.slot1 = this.slot2 = this.slot3 = 0;
    this.slots = options.slots;
    this.result = null;
  }
  // 
  getBoardContent(showResult) {
    let board = '```\n-------------------\n';
    board += `${this.wrap(this.slot1, false)}  :  ${this.wrap(this.slot2, false)}  :  ${this.wrap(this.slot3, false)}\n\n`;
    board += `${this.slots[this.slot1]}  :  ${this.slots[this.slot2]}  :  ${this.slots[this.slot3]} <\n\n`;
    board += `${this.wrap(this.slot1, true)}  :  ${this.wrap(this.slot2, true)}  :  ${this.wrap(this.slot3, true)}\n`;
    board += '-------------------\n';
    if(showResult) {
      if(this.slot1 === this.slot2 && this.slot1 === this.slot3) {
        this.client.cs.addMoney({
          user: this.message.user || this.message.author, // mention
          amount: this.money * 1.45,
          wheretoPutMoney: "wallet"
        });
        board += `| : :   "Nổ hũ"   : : |`;
      } else {
        this.client.cs.removeMoney({
          user: this.message.user || this.message.author,
          amount: this.money,
          wheretoPutMoney: "wallet",
        });
        board += `| : :   "Thua"   : : |`;
      };
    };
    return (board + '```');
  }
  // trả về tin nhắn
  async sendMessage(content) {
    if(this.options.isSlashGame) {
      return await this.message.editReply(content);
    } else return await this.message.channel.send(content);
  }
  // bắt đầu chơi game
  slotMachine() {
    this.slot1 = Math.floor(Math.random() * this.slots.length);
    this.slot2 = Math.floor(Math.random() * this.slots.length);
    this.slot3 = Math.floor(Math.random() * this.slots.length);
  }
  async startGame() {
    if(this.options.isSlashGame || !this.message.author) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
      this.options.isSlashGame = true;
    };
    this.slotMachine();
    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setTitle(this.options.embed.title)
    .setDescription(this.getBoardContent())
    .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })
    const msg = await this.sendMessage({ embeds: [embed], content: "" });
    setTimeout(async() => {
      this.slotMachine();
      embed.setDescription(this.getBoardContent());
      this.slotMachine();
      await msg.edit({ embeds: [embed], content: "" });
      setTimeout(async() => {
        return msg.edit({ 
          content: `${(this.slot1 === this.slot2 && this.slot1 === this.slot3) ? `Bạn đã thắng được ${await this.client.cs.formatter(this.money * 1.45)}` : `Bạn đã thua ${await this.client.cs.formatter(this.money)}`}`,
          embeds: [new EmbedBuilder()
          .setColor(this.options.embed.color)
          .setTitle(this.options.embed.title)
          .setDescription(this.getBoardContent(true))
          .setFooter({ text: this.message.author.tag, iconURL: this.message.author.displayAvatarURL({ dynamic: true }) })]
        });
      }, 2000);
    }, 2000);
  }
  wrap(s, add) {
    if (add) return (s+1 > this.slots.length-1) ? this.slots[0] : this.slots[s+1];
    return (s-1 < 0) ? this.slots[this.slots.length-1] : this.slots[s-1];
  }
};
/*========================================================
# xuất module
========================================================*/
module.exports = {
  RPSGame, Slots
};