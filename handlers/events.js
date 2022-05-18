const fs = require("fs");
const allEvents = [];
const { getTime } = require("../utils/functions");
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
  console.log(`${getTime()} Loaded ${amount} events!`.brightGreen);
};
