const client = require("../index");
const { getTime } = require("../utils/functions");

client.on("ready", () => {
  setInterval(() => {
    const list = [
      "+help | Waveform.cf",
      `${client.users.cache.size} users | Waveform.cf`,
      `${client.guilds.cache.size} servers | Waveform.cf`,
      `${client.channels.cache.size} channels | Waveform.cf`,
    ];
    const randomStatus = list[Math.floor(Math.random() * list.length)];
    let statusType = "WATCHING";

    client.user.setActivity(randomStatus, { type: statusType });
  }, 10000);

  console.log(`${getTime()} Logged in as ${client.user.tag}.`.brightMagenta);
});
