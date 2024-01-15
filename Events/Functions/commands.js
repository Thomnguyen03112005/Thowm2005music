const Base = class {
  constructor(options) {
    const { owner, cooldown, permissions, description, aliases, name, usage, category, command } = options || { };
    this.owner = Boolean(owner);
    this.cooldown = Number(cooldown) || 3000;
    this.permissions = permissions || [];
    this.description = description;
    this.aliases = aliases || [];
    this.category = category;
    this.command = command;
    this.usage = usage;
    this.name = name;
  };
  /**
   * Tuần tự hóa trình tạo này thành dữ liệu JSON tương thích với API.
   *
   * @ nhận xét
   * Phương pháp này chạy xác thực trên dữ liệu trước khi tuần tự hóa nó.
   * Như vậy, nó có thể gây ra lỗi nếu dữ liệu không hợp lệ.
   */
  toJSON() {
    return { ...this };
  };
};

const commandBuilders = class extends Base {
  constructor(options) {
    super(options);
  };
  /**
   * Đặt tên của lệnh này.
   *
   * @param name - Tên để sử dụng
   */
  setName(name) {
    if(name.length > 30) {
      return console.log("Tên lệnh không dài quá 30 chữ cái");
    } else if(name.length < 1) {
      return console.log("Tên lệnh không nhỏ quá 1 chữ cái");
    };
    this.name = name;
    return this;
  };
  /** 
  # Thiết lập lệnh phụ
  */
  setAliases(aliases) {
    if(aliases.length > 30) {
      return console.log("Tên lệnh phụ không dài quá 30 chữ cái");
    } else if(aliases.length < 1) {
      return console.log("Tên lệnh phụ không nhỏ quá 1 chữ cái");
    };
    this.aliases = aliases;
    return this;
  };
  /** 
  # cách sử dụng
  */
  setUsage(usage) {
    this.usage = usage;
    return this;
  };
  /*
   * Thiết lập Folder chứa lệnh
   */
  setCategory(category) {
    this.category = category;
    return this;
  };
  /** 
   # 
   */
  setOwner(owner) {
    this.owner = owner;
    return this;
  };
  /** 
  # thời gian hồi lệnh
  */
  setCooldown(cooldown) {
    this.cooldown = cooldown;
    return this;
  };
  /** 
  # mô tả kệnh
  */
  setDescription(description) {
    if(!description) return console.log("Bạn chưa thêm mô tả cho lệnh " + this.name);
    this.description = description;
    return this;
  };
  /**
   * Đặt quyền mặc định mà thành viên phải có để chạy lệnh này.
   *
   * @remarks
   * @param permissions
   * @see {@link https://discord.com/developers/docs/interactions/application-commands#permissions}
   */
  setDefaultMemberPermissions(permissions) {
    this.permissions = permissions;
    return this;
  };
  /** 
   * Thực hiênh lệnh
   */
  addCommand(command) {
    this.command = command;
    return this;
  };
};
/*========================================================
# slashCommands
========================================================*/
class slashCommandBuilder {
  constructor({ name, description, userPerms, owner, cooldown, options, run }) {
    this.name = name; // thiết lập tên
    this.description = description; // Mô tả lệnh
    this.userPerms = userPerms; // quyền của thành viên có thể sử dụng lệnh
    this.owner = owner; // true để chuyển thành lệnh của chủ bot, false để tắt
    this.cooldown = cooldown;// thời gian hồi lệnh
    this.options = options;
    this.run = run;
  };
  addSlashCommand(slashCommand) {
    this.run = slashCommand;
    return this;
  };
  toJSON() {
    return { ...this };
  };
};

module.exports = { commandBuilders, slashCommandBuilder };