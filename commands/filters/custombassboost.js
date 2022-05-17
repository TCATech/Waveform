const { Client, Message, MessageEmbed } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");

module.exports = {
  name: "custombassboost",
  description: "Sets a custom bass boost with a custom value.",
  aliases: [
    "bassboost",
    "bb",
    "bass",
    "custombass",
    "cbassboost",
    "cbass",
    "cbb",
    "custombb",
  ],
  usage: "<gain>",
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

    if (!args[0])
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You need to specify a gain between 0 and 20!`
            )
            .setColor("RED"),
        ],
      });

    let bass_gain = parseInt(args[0]);

    if (bass_gain > 20 || bass_gain < 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The bass boost gain must be between 0 and 20!`
            )
            .setColor("RED"),
        ],
      });

    FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
    client.distube.filters = FiltersSettings;
    if (newQueue.filters.includes("custombassboost")) {
      await newQueue.setFilter(["custombassboost"]);
    }
    await newQueue.setFilter(["custombassboost"]);
    return message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} The custom bass boost gain has been set to ${bass_gain}!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
