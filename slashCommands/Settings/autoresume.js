const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "autoresume", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 10, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description:
    "Enables/disables the autoresume, just in case if the bot has a restart!",
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member } = interaction;
      const { guild } = member;
      client.settings.set(
        guild.id,
        !client.settings.get(guild.id, "autoresume"),
        "autoresume"
      );
      return interaction.reply({
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
