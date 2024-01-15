/** 
const _ = new eventBuilders({
  eventCustomName: "name custom", // Tên sự kiện tùy chọn
  eventName: "", // tên sự kiện theo Discord.Events
  eventOnce: false, // khởi chạy 1 lần 
  executeEvents: async(client) => {
    // code 
  },
});

module.exports = [_];
*/

class eventBuilders {
  constructor({ eventName, eventOnce, executeEvents, eventCustomName }) {
    this.eventCustomName = eventCustomName;
    this.executeEvents = executeEvents; 
    this.eventName = eventName;
    this.eventOnce = eventOnce;
  };
  toJSON() {
    return {
      ...this
    }
  };
};

module.exports = eventBuilders;