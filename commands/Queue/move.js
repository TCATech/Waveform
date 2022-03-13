const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "move", //the command name for the Slash Command

  category: "Queue",
  usage: "move <song> <position>",

  description: "Moves one song to another place.", //the command description for Slash Command Overview
  cooldown: 10,
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
        if (check_if_dj(client, member, newQueue.songs[0])) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **You are not a DJ, nor the song requester!**`
                )
                .setDescription(
                  `**DJ roles:**\n> ${check_if_dj(
                    client,
                    member,
                    newQueue.songs[0]
                  )}`
                ),
            ],
          });
        }
        if (!args[0]) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **Please add a song position!**`
                )
                .setDescription(
                  `**Usage:**\n> \`${client.settings.get(
                    message.guild.id,
                    "prefix"
                  )}move <SongPosition> <ToPosition>\``
                ),
            ],
          });
        }
        if (!args[1]) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **Please add the new position!**`
                )
                .setDescription(
                  `**Usage:**\n> \`${client.settings.get(
                    message.guild.id,
                    "prefix"
                  )}play <SongPosition> <ToPosition>\``
                ),
            ],
          });
        }
        let songIndex = Number(args[0]);
        if (!songIndex) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **Please add a song position NUMBER!**`
                )
                .setDescription(
                  `**Usage:**\n> \`${client.settings.get(
                    message.guild.id,
                    "prefix"
                  )}move <SongPosition> <ToPosition>\``
                ),
            ],
          });
        }
        let position = Number(args[1]);
        if (!position) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **Please add the new position NUMBER!**`
                )
                .setDescription(
                  `**Usage:**\n> \`${client.settings.get(
                    message.guild.id,
                    "prefix"
                  )}play <SongPosition> <ToPosition>\``
                ),
            ],
          });
        }
        if (position >= newQueue.songs.length || position < 0) position = -1;
        if (songIndex > newQueue.songs.length - 1)
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(`${client.allEmojis.x} **This song does not exist!**`)
                .setDescription(
                  `**The last song in the queue has the index: \`${newQueue.songs.length}\`**`
                ),
            ],
          });
        if (position == 0)
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(
                  `${client.allEmojis.x} **Cannot move song before playing song!**`
                ),
            ],
          });
        let song = newQueue.songs[songIndex];
        //remove the song
        newQueue.songs.splice(songIndex);
        //Add it to a specific Position
        newQueue.addToQueue(song, position);
        message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setTimestamp()
              .setTitle(
                `📑 Moved **${
                  song.name
                }** to position **\`${position}th\`**,right after **_${
                  newQueue.songs[position - 1].name
                }_!**`
              )
              .setFooter(
                `💢 Action by: ${member.user.tag}`,
                member.user.displayAvatarURL({ dynamic: true })
              ),
          ],
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
