const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "join",
  description: "Joins your voice channel.",
  aliases: ["j"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { guildId, channelId } = message;
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
              `${client.emotes.x} I'm already in another voice channel!`
            )
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to join your voice channel...`
          )
          .setColor(client.config.color),
      ],
    });

    client.distube.voices.join(message.member.voice.channel);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.check} Joined your voice channel!`)
          .setColor(client.config.color),
      ],
    });
  },
};
