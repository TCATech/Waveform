const fs = require("fs");
const allEvents = [];
module.exports = async (client) => {
  let amount = 0;
  const event_files = fs
    .readdirSync(`./events`)
    .filter((file) => file.endsWith(".js"));
  for (const file of event_files) {
    try {
      let eventName = file.split(".")[0];
      allEvents.push(eventName);
      require(`../events/${file}`);
      amount++;
    } catch (e) {
      console.log(e);
    }
  }
  console.log(`     ${amount} events loaded`.brightGreen);
};
