const { Client, Message, MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "rewind",
  description: "Rewinds the currently playing song.",
  aliases: ["backward", "rwd", "bwd"],
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
            .setTitle(`${client.emotes.x} Please specify the rewind time!`)
            .setColor("RED"),
        ],
      });

    let seekNumber = isNaN(Number(args[0]))
      ? ms(args[0]) / 1000
      : Number(args[0]);
    let seektime = newQueue.currentTime - seekNumber;
    if (seektime < 0) seektime = 0;
    if (seektime >= newQueue.songs[0].duration - newQueue.currentTime)
      seektime = 0;

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.loading} Trying to rewind...`)
          .setColor(client.config.color),
      ],
    });

    await newQueue.seek(seektime);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Rewinded to \`${newQueue.formattedCurrentTime}\`!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
