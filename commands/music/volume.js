const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "volume",
  description: "Changes the volume of the song.",
  aliases: ["v"],
  usage: "<new volume>",
  checkDJ: true,
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guild, guildId } = message;
    const { channel } = member.voice;

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
            .setTitle(`${client.emotes.x} You need to specify the new volume!`)
            .setColor("RED"),
        ],
      });

    const volume = parseInt(args[0]);
    if (isNaN(volume))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} The new volume must be a number!`)
            .setColor("RED"),
        ],
      });

    if (volume > 100 || volume < 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The volume must be between 0 and 100!`
            )
            .setColor("RED"),
        ],
      });

    if (volume === newQueue.volume)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The new volume must not be the same as the current volume!`
            )
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to change the volume to \`${volume}%\`...`
          )
          .setColor(client.config.color),
      ],
    });

    newQueue.setVolume(volume);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Changed the volume to \`${volume}%\`!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
