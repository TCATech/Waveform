const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "list", //the command name for the Slash Command
  description: "Lists all active and possible filters!", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { guildId } = interaction;
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
          return interaction.reply({
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
            ephemeral: true,
          });
        return interaction.reply({
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
                newQueue.filters.map((f) => `\`${f}\``).join(", ")
              ),
          ],
        });
      } catch (e) {
        console.log(e.stack ? e.stack : e);
        interaction.editReply({
          content: `${client.allEmojis.x} | Error: `,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setDescription(`\`\`\`${e}\`\`\``),
          ],
          ephemeral: true,
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
