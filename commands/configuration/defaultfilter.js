const { Client, Message, MessageEmbed } = require("discord.js");
const filters = require("../../botconfig/filters.json");

module.exports = {
  name: "defaultfilter",
  description: "Changes the default filters for your server.",
  aliases: ["dfilter"],
  usage: "<filter(s)> (use spaces to seperate filters)",
  userPerms: ["MANAGE_GUILD"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guild, guildId } = message;
    const { channel } = member.voice;

    if (!args[0])
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to specify the new volume!`)
            .setColor("RED"),
        ],
      });

    if (args.some((a) => !filters[a]))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You specified at least one invalid filter!`
            )
            .addField(
              "**All valid filters:**",
              Object.keys(filters)
                .map((f) => `\`${f}\``)
                .join(", ")
            )
            .setColor("RED"),
        ],
      });

    client.settings.set(guildId, args, "defaultFilters");
    const allFilters = client.settings.get(guildId, "defaultFilters");
    let newfilters =
      args.length > 0
        ? allFilters.map((a) => `\`${a}\``).join(", ")
        : `\`Nothing\``;

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} The new default filter${
              args.length > 1 ? "s are" : " is"
            }:`
          )
          .setDescription(newfilters)
          .setColor("RED"),
      ],
    });
  },
};
