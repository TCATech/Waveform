const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
const FiltersSettings = require("../../botconfig/filters.json");
module.exports = {
  name: "custombassboost", //the command name for the Slash Command
  description: "Sets a custom bassboost with custom gain!", //the command description for Slash Command Overview
  cooldown: 5,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      Integer: {
        name: "gain",
        description: "What amount of gain should the bassboost have?",
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
            ephemeral: true,
          });
        }
        let bass_gain = options.getInteger("bass_gain");

        if (bass_gain > 20 || bass_gain < 0) {
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(
                  ee.footertext + "hi :) you found an easter egg",
                  ee.footericon
                )
                .setTitle(
                  `${client.allEmojis.x} **The bassboost gain must be between 0 and 20!**`
                ),
            ],
          });
        }
        FiltersSettings.custombassboost = `bass=g=${bass_gain},dynaudnorm=f=200`;
        client.distube.filters = FiltersSettings;
        //add old filters so that they get removed
        //if it was enabled before then add it
        if (newQueue.filters.includes("custombassboost")) {
          await newQueue.setFilter(["custombassboost"]);
        }
        await newQueue.setFilter(["custombassboost"]);
        interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setTimestamp()
              .setTitle(`♨️ **Set the custom bassboost to ${bass_gain}!**`)
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
