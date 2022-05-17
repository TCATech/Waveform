const { Client, Message, MessageEmbed } = require("discord.js");
const FiltersSettings = require("../../botconfig/filters.json");

module.exports = {
  name: "customspeed",
  description: "Sets a custom speed with a custom amount.",
  aliases: ["speed", "changespeed", "cspeed"],
  usage: "<amount>",
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

    let speed_amount = parseInt(args[0]);

    if (speed_amount > 2 || speed_amount <= 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The bass boost gain must be between 0 and 20!`
            )
            .setColor("RED"),
        ],
      });

    FiltersSettings.customspeed = `atempo=${speed_amount}`;
    client.distube.filters = FiltersSettings;
    if (newQueue.filters.includes("customspeed")) {
      await newQueue.setFilter(["customspeed"]);
    }
    await newQueue.setFilter(["customspeed"]);
    return message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} The custom speed amount has been set to ${speed_amount}!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
