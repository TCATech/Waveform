const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "playtop",
  description:
    "Plays a song in a voice channel and adds it to the top of the queue.",
  aliases: ["pt"],
  usage: "<song name or url>",
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
              "Join my voice channel: <#" +
                message.guild.me.voice.channel.id +
                ">"
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

    const query = args.join(" ");
    if (!query)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to specify a song to play!`)
            .setColor("RED"),
        ],
      });

    const res = await message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`🔎 Searching for:`)
          .setDescription("```" + query + "```")
          .setColor(client.config.color),
      ],
    });

    const queue = client.distube.getQueue(guildId);
    let options = {
      member: message.member,
      position: 1,
    };
    if (!queue)
      options.textChannel = message.guild.channels.cache.get(channelId);

    await client.distube.play(message.member.voice.channel, query, options);

    let result = "";
    if (!queue) {
      result = client.distube.getQueue(guildId).songs[0].name;
    } else {
      result = queue?.songs[queue?.songs?.length - 1].name;
    }
    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${
              queue?.songs?.length > 0
                ? "👍 Added to the top of the queue"
                : "🎶 Now playing"
            }:`
          )
          .setDescription("```" + result + "```")
          .setColor(client.config.color),
      ],
    });
  },
};
