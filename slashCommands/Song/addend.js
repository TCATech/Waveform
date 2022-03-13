const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "addend", //the command name for the Slash Command
  description: "Adds this song to the end of the queue!", //the command description for Slash Command Overview
  cooldown: 15,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, guildId } = interaction;
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
        await client.distube.playVoiceChannel(channel, newQueue.songs[0].url);
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
