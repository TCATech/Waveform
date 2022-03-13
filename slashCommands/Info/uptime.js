const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const { duration } = require("../../handlers/functions");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "uptime", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Returns the durartion that the bot has been up for.", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(
              `:white_check_mark: **${
                client.user.username
              }** has been online for:\n ${duration(client.uptime)
                .map((t) => `\`${t}\``)
                .join(", ")}`
            ),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
