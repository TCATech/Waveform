const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "loop", //the command name for the Slash Command

  category: "Queue",
  aliases: ["repeat", "repeatmode", "l"],
  usage: "loop [song/queue/off]",

  description: "Enable or disable loop.", //the command description for Slash Command Overview
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
        let loop = "";
        if (!["off", "song", "queue"].includes(args[0].toLowerCase())) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **Please add valid options!**`)
                .setDescription(
                  `**Usage:**\n> \`${client.settings.get(
                    message.guild.id,
                    "prefix"
                  )}loop <song/queue/off>\``
                ),
            ],
          });
        }
        if (!args[0]) {
          if (newQueue.repeatMode === 0) {
            loop = 1;
          } else if (newQueue.repeatMode === 1) {
            loop = 2;
          } else if (newQueue.repeatMode === 2) {
            loop = 0;
          }
        }
        if (args[0].toLowerCase() == "off") loop = 0;
        else if (args[0].toLowerCase() == "song") loop = 1;
        else if (args[0].toLowerCase() == "queue") loop = 2;
        await newQueue.setRepeatMode(loop);
        let mode = newQueue.repeatMode
          ? newQueue.repeatMode == 2
            ? "Repeat queue"
            : "Repeat song"
          : "";
        message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setTimestamp()
              .setTitle(
                `${
                  queue.repeatMode !== 0
                    ? `${client.allEmojis.check_mark} **Repeat mode set to ${mode}!**`
                    : `${client.allEmojis.x} **Disabled repeat mode!**`
                }`
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
