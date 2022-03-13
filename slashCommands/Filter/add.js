const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const FiltersSettings = require("../../botconfig/filters.json");
const { check_if_dj } = require("../../handlers/functions");

module.exports = {
  name: "add", //the command name for the Slash Command
  description: "Add a filter to the queue.", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      String: {
        name: "filters",
        description:
          "All of the filters you want to add. Add a space in between to add multiple filters!",
        required: true,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, guildId, options } = interaction;
      const { guild } = member;
      const { channel } = member.voice;
      if (!channel)
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setTitle(
                `${client.allEmojis.x} **Please join ${
                  guild.me.voice.channel ? "__my__" : "a"
                } voice channel first!**`
              ),
          ],
          ephemeral: true,
        });
      if (
        channel.guild.me.voice.channel &&
        channel.guild.me.voice.channel.id != channel.id
      ) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(`${client.allEmojis.x} Join __my__ voice channel!`)
              .setDescription(`<#${guild.me.voice.channel.id}>`),
          ],
          ephemeral: true,
        });
      }
      try {
        let newQueue = client.distube.getQueue(guildId);
        if (!newQueue || !newQueue.songs || newQueue.songs.length == 0)
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(
                  `${client.allEmojis.x} **I am not playing anything right now!**`
                ),
            ],
            ephemeral: true,
          });
        if (check_if_dj(client, member, newQueue.songs[0])) {
          return interaction.reply({
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
            ephemeral: true,
          });
        }
        let filters = options.getString("filters").toLowerCase().split(" ");
        if (!filters) filters = [options.getString("filters").toLowerCase()];
        if (filters.some((a) => !FiltersSettings[a])) {
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **You added at least one filter that is invalid**`
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
        let toAdded = [];
        //add new filters
        filters.forEach((f) => {
          if (!newQueue.filters.includes(f)) {
            toAdded.push(f);
          }
        });
        if (!toAdded || toAdded.length == 0) {
          return interaction.reply({
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
        await newQueue.setFilter(toAdded);
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setTimestamp()
              .setTitle(
                `♨️ **Added ${toAdded.length} ${
                  toAdded.length == filters.length
                    ? "filters!"
                    : `of ${filters.length} filters! The rest were already added as filters!`
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
        interaction.editReply({
          content: `${client.allEmojis.x} | Error: `,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setDescription(`\`\`\`${e}\`\`\``),
          ],
          ephemeral: true,
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
