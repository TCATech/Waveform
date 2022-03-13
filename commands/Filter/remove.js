const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
const FiltersSettings = require("../../botconfig/filters.json");
module.exports = {
  name: "removefilter", //the command name for the Slash Command

  category: "Filter",
  usage: "removefilter <filter1 filter2 etc.>",
  aliases: ["removefilters", "remove", "removef"],

  description: "Removes a filter from the queue.", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      const { member, guildId, guild } = message;
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
                  `${client.allEmojis.x}**You are not a DJ, nor the song requester!**`
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
        let filters = args;
        if (filters.some((a) => !FiltersSettings[a])) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **You added at least one filter that is invalid!**`
                )
                .setDescription(
                  "**To define multiple filters add a SPACE (` `) in between!**"
                )
                .addField(
                  "**All valid filters:**",
                  Object.keys(FiltersSettings)
                    .map((f) => `\`${f}\``)
                    .join(", ") +
                    "\n\n**Note:**\n> *All filters that start with `custom` have their own command, please use them to define what custom amount you want!*"
                ),
            ],
          });
        }
        let toRemove = [];
        //add new filters    bassboost, clear    --> [clear] -> [bassboost]
        filters.forEach((f) => {
          if (newQueue.filters.includes(f)) {
            toRemove.push(f);
          }
        });
        if (!toRemove || toRemove.length == 0) {
          return message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **You did not add a filter that isn't already added.**`
                )
                .addField(
                  "**All __current__ Filters:**",
                  newQueue.filters.map((f) => `\`${f}\``).join(", ")
                ),
            ],
          });
        }
        await newQueue.setFilter(toRemove);
        message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setTimestamp()
              .setTitle(
                `♨️ **Removed ${toRemove.length} ${
                  toRemove.length == filters.length
                    ? "filters!"
                    : `of ${filters.length} filters! The rest weren't part of the filters!`
                }**`
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
