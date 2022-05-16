const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "leave",
  description: "Leaves your voice channel.",
  aliases: ["disconnect", "break", "destroy", "l"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    if (!message.member.voice.channel)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to be in a voice channel!`)
            .setColor("RED"),
        ],
      });

    if (
      message.guild.me.voice.channel &&
      message.guild.me.voice.channel.id !== message.member.voice.channel.id
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

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to leave your voice channel...`
          )
          .setColor(client.config.color),
      ],
    });

    client.distube.voices.leave(message.guild.id);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.check} Left your voice channel!`)
          .setColor(client.config.color),
      ],
    });
  },
};
