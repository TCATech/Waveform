const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "addsimilar",
  description: "Adds a similar/related song to the current one in the queue.",
  aliases: ["adds", "addrelated", "addr"],
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
          .setTitle(`🔎 Searching for a song related to:`)
          .setDescription("```" + newQueue.songs[0].name + "```")
          .setColor(client.config.color),
      ],
    });

    await newQueue.addRelatedSong();

    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(`👍 Added:`)
          .setDescription(
            "```" + newQueue.songs[newQueue.songs.length - 1].name + "```"
          )
          .setColor(client.config.color),
      ],
    });
  },
};
