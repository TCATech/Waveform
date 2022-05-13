// Bot client

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

// Distube client

const { DisTube } = require("distube");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { SpotifyPlugin } = require("@distube/spotify");
const { YtDlpPlugin } = require("@distube/yt-dlp");

client.distube = new DisTube(client, {
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  searchSongs: false,
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
});

["distubeEvents"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});
