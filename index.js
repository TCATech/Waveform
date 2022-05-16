// Bot client

const { Client, Collection } = require("discord.js");
const Enmap = require("enmap");
var colors = require("colors");
require("dotenv/config");
const client = new Client({
  intents: 32767,
  restTimeOffset: 0,
  allowedMentions: {
    parse: [],
    repliedUser: false,
  },
});
module.exports = client;

client.config = require("./botconfig/config.json");
client.emotes = require("./botconfig/emojis.json");
client.commands = new Collection();
client.categories = require("fs").readdirSync(`./commands`);
client.events = new Collection();
client.slashCommands = new Collection();
client.settings = new Enmap({
  name: "settings",
  dataDir: "./databases/settings",
});
client.maps = new Map();

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

["commands", "slashCommands", "events"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN || client.config.token);

// Distube client

const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const filters = require("./botconfig/filters.json");

client.distube = new DisTube(client, {
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  youtubeDL: false,
  updateYouTubeDL: false,
  plugins: [
    new SoundCloudPlugin(),
    new SpotifyPlugin({
      emitEventsAfterFetching: true,
    }),
    new YtDlpPlugin(),
  ],
  savePreviousSongs: true,
  customFilters: filters,
});

["distubeEvents"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});
