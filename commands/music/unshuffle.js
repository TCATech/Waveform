const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "unshuffle",
  description: "Unshuffles/unrandomizes the queue.",
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

    if (!client.maps.has(`beforeshuffle-${newQueue.id}`))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} This queue has never been shuffled before!`
            )
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.loading} Trying to unshuffle the queue...`)
          .setColor(client.config.color),
      ],
    });

    newQueue.songs = [
      newQueue.songs[0],
      ...client.maps.get(`beforeshuffle-${newQueue.id}`),
    ];
    client.maps.delete(`beforeshuffle-${newQueue.id}`);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.shuffle} Unshuffled the queue!`)
          .setColor(client.config.color),
      ],
    });
  },
};
