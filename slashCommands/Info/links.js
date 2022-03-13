const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
var ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const websiteSettings = require("../../dashboard/settings.json");
module.exports = {
  name: "dashboard", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Sends all of the links related to the bot.", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, guildId } = interaction;
      const { guild } = member;
      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setDescription(
              `> **Website:** ${websiteSettings.website.domain}/\n\n> **Dashboard:** ${websiteSettings.website.domain}/dashboard\n\n> **Server queues:** ${websiteSettings.website.domain}/queuedashboard\n\n> **Current server queue:** ${websiteSettings.website.domain}/queue/${message.guild.id}`
            )
            .setTimestamp(),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
