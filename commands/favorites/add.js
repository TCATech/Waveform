const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "addfavorites",
  description: "Add this song or another song to your favorites.",
  aliases: [
    "addfavorite",
    "addfavourite",
    "addfavourites",
    "addfav",
    "addfavs",
    "afav",
    "afavs",
    "af",
    "afs",
  ],
  usage: "[song name or url]",
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guildId, channelId } = message;
    const { channel } = member.voice;
    client.settings.ensure(member.id, {
      favorites: [],
    });
    if (!args[0]) {
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
              .setTitle(
                `${client.emotes.x} I'm not playing anything right now!`
              )
              .setColor("RED"),
          ],
        });

      const query = newQueue.songs[0].name;
      const res = await message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.loading} Adding:`)
            .setDescription("```" + query + "```")
            .setColor(client.config.color),
        ],
      });
      const data = client.settings.get(member.id, "favorites");
      if (data.includes(query)) {
        return res.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(`${client.emotes.x} Already favorited:`)
              .setDescription("```" + query + "```")
              .setColor(client.config.color),
          ],
        });
      }
      client.settings.push(member.id, track.name, "favorites");
      res.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.favorite} Added:`)
            .setDescription("```" + query + "```")
            .setColor(client.config.color),
        ],
      });
    } else {
      const query = args.join(" ");
      const res = await message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`🔍 Searching for:`)
            .setDescription("```" + query + "```")
            .setColor(client.config.color),
        ],
      });
      client.distube
        .search(query, {
          limit: 1,
        })
        .then((tracks) => {
          const data = client.settings.get(member.id, "favorites");
          if (data.includes(tracks[0].name)) {
            return res.edit({
              embeds: [
                new MessageEmbed()
                  .setTitle(`${client.emotes.x} Already favorited:`)
                  .setDescription("```" + tracks[0].name + "```")
                  .setColor(client.config.color),
              ],
            });
          }
          client.settings.push(member.id, tracks[0].name, "favorites");
          res.edit({
            embeds: [
              new MessageEmbed()
                .setTitle(`${client.emotes.favorite} Added:`)
                .setDescription("```" + tracks[0].name + "```")
                .setColor(client.config.color),
            ],
          });
        });
    }
  },
};
