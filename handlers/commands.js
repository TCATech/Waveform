const { readdirSync } = require("fs");
const { getTime } = require("../utils/functions");
module.exports = (client) => {
  let amount = 0;
  readdirSync("./commands/").forEach((directory) => {
    const commands = readdirSync(`./commands/${directory}/`).filter((file) =>
      file.endsWith(".js")
    );
    for (let file of commands) {
      let pull = require(`../commands/${directory}/${file}`);
      if (pull.name) {
        const properties = { directory, ...pull };
        client.commands.set(pull.name, properties);
        amount++;
      } else {
        continue;
      }
    }
  });
  console.log(`${getTime()} Loaded ${amount} commands!`.brightGreen);
};
