const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "autoresume", //the command name for execution & for helpcmd [OPTIONAL]

  category: "Settings",
  aliases: ["aresume"],
  usage: "autoresume",

  cooldown: 10, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description:
    "Enables/disables the autoresume, just in case if the bot has a restart!", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      //things u can directly access in an interaction!
      const { member } = message;
      const { guild } = member;
      client.settings.set(
        guild.id,
        !client.settings.get(guild.id, "autoresume"),
        "autoresume"
      );
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(
              `${client.allEmojis.check_mark} **Autoresume is now ${
                client.settings.get(guild.id, "autoresume")
                  ? "enabled"
                  : "disabled"
              }**`
            ),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
