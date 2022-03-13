const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
var ee = require("../../botconfig/embed.json");
module.exports = {
  name: "source", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 5, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Sends you a link to the source code.", //the command description for helpcmd [OPTIONAL]
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
            .setDescription(
              `**When you use our source code, make sure to give credits to [TCA Tech](https://github.com/TCATech) and [Tomato6966](https://github.com/Tomato6966)!** :heart:`
            ),
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel("Source code")
              .setStyle("LINK")
              .setURL("https://github.com/TCATech/Musicful")
          ),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
