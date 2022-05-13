const { readdirSync } = require("fs");
module.exports = (client) => {
  let amount = 0;
  readdirSync("./commands/").forEach((dir) => {
    const commands = readdirSync(`./commands/${dir}/`).filter((file) =>
      file.endsWith(".js")
    );
    for (let file of commands) {
      let pull = require(`../commands/${dir}/${file}`);
      if (pull.name) {
        client.commands.set(pull.name, pull);
        amount++;
      } else {
        continue;
      }
    }
  });
  console.log(`     ${amount} commands loaded`.brightGreen);
};
