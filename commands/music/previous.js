const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "previous",
  description: "Plays the previous song.",
  aliases: ["pre", "prev"],
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

    if (!newQueue.previousSongs || newQueue.previousSongs.length === 0) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} There are no previous songs!`)
            .setColor("RED"),
        ],
      });
    }

    await client.distube.previous(i.guild.id);
    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.previous} Now playing the previous song!`)
          .setColor(client.config.color),
      ],
    });
  },
};
