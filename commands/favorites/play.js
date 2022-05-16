const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "playfavorites",
  description: "Plays one of your favorite songs!",
  aliases: [
    "playfavorite",
    "playfavourite",
    "playfavourites",
    "playfav",
    "pfav",
    "pfavs",
    "pf",
    "pfs",
  ],
  usage: `<position or "random">`,
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { guildId, channelId } = message;
    client.settings.ensure(message.author.id, {
      favorites: [],
    });
    const favorites = client.settings.get(message.author.id, "favorites");
    let song;
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
    if (!args[0])
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You need to specify the song position!`
            )
            .setDescription(
              "To see all of your favorites and their positions, do `" +
                message.prefix +
                "favorites`."
            )
            .setColor("RED"),
        ],
      });
    if (args[0] === "random")
      song = Number(Math.floor(Math.random() * favorites.length + 1));
    else song = Number(args[0]);
    if (isNaN(song))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} The song posiiton must be a number!`)
            .setColor("RED"),
        ],
      });
    if (!song || song > favorites.length)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The song must be part of your favorites!`
            )
            .setColor("RED"),
        ],
      });
    const query = favorites[song - 1];
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
    };
    if (!queue)
      options.textChannel = message.guild.channels.cache.get(channelId);

    await client.distube.play(message.member.voice.channel, query, options);
    res.edit({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${queue?.songs?.length > 0 ? "👍 Added" : "🎶 Now playing"}:`
          )
          .setDescription("```" + query + "```")
          .setColor(client.config.color),
      ],
    });
  },
};
