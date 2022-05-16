const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "np",
  description: "Shows the currently playing song.",
  aliases: ["nowplaying", "current"],
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

    let newTrack = newQueue.songs[0];
    const embed = new MessageEmbed()
      .setAuthor({
        name: "Currently playing:",
        iconURL:
          "https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif",
      })
      .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setTitle(newTrack.name)
      .setURL(newTrack.url)
      .addField("⏱ Duration", `\`${newTrack.formattedDuration}\``)
      .addField(
        "💻 Uploader",
        `[${newTrack.uploader.name}](${newTrack.uploader.url})`
      )
      .addField("🔁 Queue Length", newQueue.songs.length.toString())
      .setColor(client.config.color)
      .setFooter({
        text: `Requested by: ${newTrack.user.tag}`,
        iconURL: newTrack.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    message.reply({
      embeds: [embed],
    });
  },
};
