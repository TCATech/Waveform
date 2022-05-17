const { Client, Message, MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "seek",
  description: "Changes the position/seek of the song.",
  aliases: ["forward", "fwd"],
  usage: "<time>",
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
            .setTitle(`${client.emotes.x} Please specify the seek time!`)
            .setColor("RED"),
        ],
      });

    if (Number(args[0]) < 0 || Number(args[0]) > newQueue.songs[0].duration)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You can only seek between 0 and the length of the current song!`
            )
            .setColor("RED"),
        ],
      });
    else if (
      ms(args[0]) / 1000 < 0 ||
      ms(args[0]) / 1000 > newQueue.songs[0].duration
    )
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You can only seek between 0 and the length of the current song!`
            )
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.loading} Trying to seek...`)
          .setColor(client.config.color),
      ],
    });

    client.distube.seek(
      guildId,
      isNaN(Number(args[0])) ? ms(args[0]) / 1000 : Number(args[0])
    );

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Seeked to \`${newQueue.formattedCurrentTime}\`!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
