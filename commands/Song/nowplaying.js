const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "nowplaying", //the command name for the Slash Command
  category: "Song",
  usage: "nowplaying",
  aliases: ["np", "current"],
  description: "Shows some info about the currently playing song.", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      //things u can directly access in an interaction!
      const { member, guildId } = message;
      const { guild } = member;
      const { channel } = member.voice;
      if (!channel)
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setTitle(
                `${client.allEmojis.x} **Please join ${
                  guild.me.voice.channel ? "__my__" : "a"
                } voice channel first!**`
              ),
          ],
        });
      if (
        channel.guild.me.voice.channel &&
        channel.guild.me.voice.channel.id != channel.id
      ) {
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(`${client.allEmojis.x} Join __my__ voice channel!`)
              .setDescription(`<#${guild.me.voice.channel.id}>`),
          ],
        });
      }
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(
                  `${client.allEmojis.x} **I am not playing anything right now!**`
                ),
            ],
          });
        let newTrack = newQueue.songs[0];
        message
          .reply({
            content: `${client.settings.get(guild.id, "prefix")}play ${
              newTrack.url
            }`,
            embeds: [
              new MessageEmbed()
                .setColor(ee.color)
                .setDescription(
                  `[See the queue on the **DASHBOARD**!](${
                    require(`../dashboard/settings.json`).website.domain
                  }/queue/${newQueue.id})`
                )
                .addField(`💡 Requested by:`, `>>> ${newTrack.user}`, true)
                .addField(`🔊 Volume:`, `>>> \`${newQueue.volume}%\``, true)
                .addField(
                  `🌀 Queue:`,
                  `>>> \`${newQueue.songs.length} song${
                    newQueue.songs.length > 1 ? "s" : ""
                  }\`\n\`${newQueue.formattedDuration}\``,
                  true
                )
                .addField(
                  `♾ Loop:`,
                  `>>> ${
                    newQueue.repeatMode
                      ? newQueue.repeatMode === 2
                        ? `${client.allEmojis.check_mark}\` Queue\``
                        : `${client.allEmojis.check_mark} \` Song\``
                      : `${client.allEmojis.x}`
                  }`,
                  true
                )
                .addField(
                  `❔ Filter${newQueue.filters.length > 0 ? `s` : ``}:`,
                  `>>> ${
                    newQueue.filters && newQueue.filters.length > 0
                      ? `${newQueue.filters.map((f) => `\`${f}\``).join(`, `)}`
                      : `${client.allEmojis.x}`
                  }`,
                  newQueue.filters.length > 4 ? false : true
                )
                .addField(
                  `🎧 DJ roles${
                    client.settings.get(newQueue.id, `djroles`).length > 1
                      ? `s`
                      : ``
                  }:`,
                  `>>> ${djs}`,
                  newQueue.filters.length > 4 ? false : true
                )
                .addField(
                  `⏱ Duration:`,
                  `\`${newQueue.formattedCurrentTime}\` ${createBar(
                    newQueue.songs[0].duration,
                    newQueue.currentTime,
                    13
                  )} \`${newQueue.songs[0].formattedDuration}\``
                )
                .setAuthor(
                  `${newTrack.name}`,
                  `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`,
                  newTrack.url
                )
                .setThumbnail(
                  `https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`
                )
                .setFooter(
                  `Played in: ${guild.name}`,
                  guild.iconURL({
                    dynamic: true,
                  })
                )
                .setTimestamp(),
            ],
          })
          .catch((e) => {
            onsole.log(e.stack ? e.stack : e);
          });
      } catch (e) {
        console.log(e.stack ? e.stack : e);
        message.reply({
          content: `${client.allEmojis.x} | Error: `,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setDescription(`\`\`\`${e}\`\`\``),
          ],
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
