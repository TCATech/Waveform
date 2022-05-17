const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "songloop",
  description: "Enables or disables the song loop.",
  aliases: ["trackloop", "sl", "tl"],
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

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.loading} Trying to ${
              newQueue.repeatMode === 1 ? "disable" : "enable"
            } the song loop...`
          )
          .setColor(client.config.color),
      ],
    });

    if (newQueue.repeatMode === 1) newQueue.setRepeatMode(0);
    else newQueue.setRepeatMode(1);

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} ${
              newQueue.repeatMode === 1 ? "Enabled" : "Disabled"
            } the song loop!`
          )
          .setColor(client.config.color),
      ],
    });
  },
};
