const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "playuser",
  description: "Play what a user is listening to on spotify!",
  aliases: ["playmember", "puser", "pmember", "pu", "pm"],
  usage: "[@user or user ID]",
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { guildId, channelId } = message;
    const pinged =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;
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

    if (pinged.presence.activities === null)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} ${
                pinged === message.member ? "You aren't" : "That user isn't"
              }  isn't listening to Spotify.`
            )
            .setColor("RED"),
        ],
      });

    var spotifydetected = false;
    var songname = undefined;
    var artist = undefined;
    for (i = 0; i < pinged.presence.activities.length; i++) {
      if (pinged.presence.activities[i].name == "Spotify") {
        spotifydetected = true;
        songname = pinged.presence.activities[i].details;
        artist = pinged.presence.activities[i].state;
      }
    }
    if (spotifydetected === false) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} ${
                pinged === message.member ? "You aren't" : "That user isn't"
              } listening to Spotify.`
            )
            .setColor("RED"),
        ],
      });
    } else {
      const query = `${songname} by ${artist}`;
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
              `${queue?.songs?.length > 0 ? "👍 Added" : "🎶 Now playing"}:`
            )
            .setDescription("```" + result + "```")
            .setColor(client.config.color),
        ],
      });
    }
  },
};
