const client = require("../index");

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

  console.log("\n");
  console.log(
    `     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`
      .bold.brightGreen
  );
  console.log(
    `     ┃ `.bold.brightGreen +
      " ".repeat(-1 + 69 - ` ┃ `.length) +
      "┃".bold.brightGreen
  );
  console.log(
    `     ┃ `.bold.brightGreen +
      `${client.user.tag} is now online!`.bold.brightGreen +
      " ".repeat(
        -1 + 69 - ` ┃ `.length - `${client.user.tag} is now online!`.length
      ) +
      "┃".bold.brightGreen
  );
  console.log(
    `     ┃ `.bold.brightGreen +
      " ".repeat(-1 + 69 - ` ┃ `.length) +
      "┃".bold.brightGreen
  );
  console.log(
    `     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      .bold.brightGreen
  );
});
