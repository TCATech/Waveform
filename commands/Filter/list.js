const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "filters", //the command name for the Slash Command

  category: "Filter",
  usage: "filters",
  aliases: ["listfilter", "listfilters", "allfilters"],

  description: "Lists all active and possible filters!", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      const { guildId } = message;
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .addField(
                  "**All available filters:**",
                  Object.keys(FiltersSettings)
                    .map((f) => `\`${f}\``)
                    .join(", ") +
                    "\n\n**Note:**\n> *All filters that start with `custom` have their own command, please use them to define what custom amount you want!*"
                ),
            ],
          });
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .addField(
                "**All available filters:**",
                Object.keys(FiltersSettings)
                  .map((f) => `\`${f}\``)
                  .join(", ") +
                  "\n\n**Note:**\n> *All filters that start with `custom` have their own command, please use them to define what custom amount you want!*"
              )
              .addField(
                "**All __current__ filters:**",
                newQueue.filters && newQueue.filters.length > 0
                  ? newQueue.filters.map((f) => `\`${f}\``).join(", ")
                  : `${client.allEmojis.x}`
              ),
          ],
        });
      } catch (e) {
        console.log(e.stack ? e.stack : e);
        message.reply({
          content: `${client.allEmojis.x} | Error: `,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setDescription(`\`\`\`${e}\`\`\``),
          ],
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
