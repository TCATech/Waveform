const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "addrelated", //the command name for the Slash Command
  category: "Music",
  usage: "addrelated",
  description: "Add a similar/related song to the current song!", //the command description for Slash Command Overview
  cooldown: 2,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL
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
        channel.userLimit != 0 &&
        channel.full &&
        !channel.guild.me.voice.channel
      )
        return message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} Your voice channel is full, so I can't join!`
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
        //update it without a response!
        let thenewmsg = await message
          .reply({
            content: `🔍 Searching for a song related to... **${newQueue.songs[0].name}**`,
          })
          .catch((e) => {
            console.log(e);
          });
        await newQueue.addRelatedSong();
        await thenewmsg
          .edit({
            content: `👍 Added: **${
              newQueue.songs[newQueue.songs.length - 1].name
            }**`,
          })
          .catch((e) => {
            console.log(e);
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
