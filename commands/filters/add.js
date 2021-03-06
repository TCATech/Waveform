const { Client, Message, MessageEmbed } = require("discord.js");
const filters = require("../../botconfig/filters.json");

module.exports = {
  name: "addfilter",
  description: "Add a filter to the queue.",
  aliases: ["addfilters", "add", "addf", "af"],
  usage: "<filter(s)> (use spaces to seperate filters)",
  checkDJ: true,
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guild, guildId } = message;
    const { channel } = member.voice;
    if (!channel)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to be in a voice channel!`)
            .setColor("RED"),
        ],
      });

    if (
      guild.me.voice.channel &&
      guild.me.voice.channel.id !== member.voice.channel.id
    )
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You need to be in __my__ voice channel!`
            )
            .setDescription(
              "Join my voice channel: <#" + guild.me.voice.channel.id + ">"
            )
            .setColor("RED"),
        ],
      });

    let newQueue = client.distube.getQueue(guildId);
    if (!newQueue || !newQueue.songs || newQueue.songs.length === 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} I'm not playing anything right now!`)
            .setColor("RED"),
        ],
      });

    let specifiedFilters = args;
    if (specifiedFilters.some((a) => !filters[a]))
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
    let toAdded = [];
    specifiedFilters.forEach((f) => {
      if (!newQueue.filters.includes(f)) {
        toAdded.push(f);
      }
    });
    if (!toAdded || toAdded.length === 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} All of the filters you specified are already in the queue!`
            )
            .setColor("RED"),
        ],
      });
    await newQueue.setFilter(toAdded);
    message.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.color)
          .setTitle(
            `${client.emotes.add} **Added ${toAdded.length} ${
              toAdded.length === specifiedFilters.length
                ? `filter${toAdded.length > 1 ? "s" : ""}`
                : `of ${specifiedFilters.length} filter${
                    specifiedFilters.length > 1 ? "s" : ""
                  }! The rest were already in the queue!`
            }**`
          ),
      ],
    });
  },
};
