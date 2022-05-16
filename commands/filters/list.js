const { Client, Message, MessageEmbed } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");

module.exports = {
  name: "filters",
  description: "Lists all the filters.",
  aliases: ["listfilter", "listfilters", "allfilter", "allfilters"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { guildId } = message;
    let newQueue = client.distube.getQueue(guildId);
    if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.color)
            .addField(
              "**All available filters:**",
              Object.keys(FiltersSettings)
                .map((f) => `\`${f}\``)
                .join(", ")
            )
            .addField(
              "**All __current__ filters:**",
              `${client.emotes.x} \`Nothing playing\``
            ),
        ],
      });

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.color)
          .addField(
            "**All available filters:**",
            Object.keys(FiltersSettings)
              .map((f) => `\`${f}\``)
              .join(", ")
          )
          .addField(
            "**All __current__ filters:**",
            newQueue.filters && newQueue.filters.length > 0
              ? newQueue.filters.map((f) => `\`${f}\``).join(", ")
              : `${client.emotes.x} None`
          ),
      ],
    });
  },
};
