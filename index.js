const { Client, Collection } = require("discord.js");
const Enmap = require("enmap");
var colors = require("colors");
require("dotenv/config");
const client = new Client({
  intents: 32767,
  restTimeOffset: 0,
});
module.exports = client;

client.config = require("./config.json");
client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.settings = new Enmap({
  name: "settings",
  dataDir: "./databases/settings",
});

console.log("\n");
console.log(
  `     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`
    .bold.brightRed
);
console.log(
  `     ┃ `.bold.brightRed +
    " ".repeat(-1 + 69 - ` ┃ `.length) +
    "┃".bold.brightRed
);
console.log(
  `     ┃ `.bold.brightRed +
    "Loading the bot...".bold.brightRed +
    " ".repeat(-1 + 69 - ` ┃ `.length - "Loading the bot...".length) +
    "┃".bold.brightRed
);
console.log(
  `     ┃ `.bold.brightRed +
    " ".repeat(-1 + 69 - ` ┃ `.length) +
    "┃".bold.brightRed
);
console.log(
  `     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
    .bold.brightRed
);
console.log("\n");

["commands", "events"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);
