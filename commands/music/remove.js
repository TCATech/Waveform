const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "remove",
  description: "Removes a song from the queue.",
  aliases: ["delete", "del", "rem"],
  usage: "<song position>",
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
              `${client.emotes.x} You need to specify the song position to remove!`
            )
            .setColor("RED"),
        ],
      });

    let songIndex = Number(args[0]);

    if (isNaN(songIndex))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} The song position must be a number!`)
            .setColor("RED"),
        ],
      });
    if (songIndex > newQueue.songs.length - 1)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} That song position doesn't exist in the queue!`
            )
            .setColor("RED"),
        ],
      });

    if (songIndex <= 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You can't remove the current song!`)
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to remove song #${songIndex} from the queue...`
          )
          .setColor(client.config.color),
      ],
    });

    newQueue.songs.splice(songIndex, 1);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Removed song #${songIndex} from the queue!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
