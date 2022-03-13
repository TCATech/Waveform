const { MessageEmbed } = require("discord.js");
var ee = require("../../botconfig/embed.json");
const websiteSettings = require("../../dashboard/settings.json");
module.exports = {
  name: "links",
  category: "Info",
  usage: "dashboard",
  aliases: ["dashboard", "dash", "website"],
  cooldown: 1,
  description: "Sends all of the links related to the bot.",
  memberpermissions: [],
  requiredroles: [],
  alloweduserids: [],
  run: async (client, message, args) => {
    try {
      message.reply({
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
