const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "loop",
  description: "Changes the loop mode.",
  aliases: ["repeat", "l"],
  usage: "[off, song, or queue]",
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

    const option = args[0] ? args[0].toLowerCase() : null;
    let loop;
    if (!args[0]) {
      switch (newQueue.repeatMode) {
        case 0:
          {
            loop = 1;
          }
          break;
        case 1:
          {
            loop = 2;
          }
          break;
        case 2:
          {
            loop = 0;
          }
          break;
      }
    } else if (
      option === "song" ||
      option === "track" ||
      option === "s" ||
      option === "t"
    ) {
      if (newQueue.repeatMode === 1) {
        loop = 0;
      } else {
        loop = 1;
      }
    } else if (option === "queue" || option === "qu" || option === "q") {
      if (newQueue.repeatMode === 2) {
        loop = 0;
      } else {
        loop = 2;
      }
    } else if (option === "off" || option === "stop") {
      loop = 0;
    }
    let loopMsg = "";
    switch (loop) {
      case 0:
        {
          loopMsg = "Off";
        }
        break;
      case 1:
        {
          loopMsg = "Song";
        }
        break;
      case 2:
        {
          loopMsg = "Queue";
        }
        break;
    }
    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to change the loop mode to ${loopMsg}...`
          )
          .setColor(client.config.color),
      ],
    });

    newQueue.setRepeatMode(loop);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.loop} Set loop mode to ${loopMsg}!`)
          .setColor(client.config.color),
      ],
    });
  },
};
