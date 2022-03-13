const { MessageEmbed, Message } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "move", //the command name for the Slash Command
  description: "Moves one song to another place.", //the command description for Slash Command Overview
  cooldown: 10,
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      Integer: {
        name: "song",
        description: "What song position do you want to remove?",
        required: true,
      },
    },
    {
      Integer: {
        name: "position",
        description:
          "Where should I move the song? (1 is after the current song, -1 is at the top)",
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
        let songIndex = options.getInteger("song");
        let position = options.getInteger("position");
        if (position >= newQueue.songs.length || position < 0) position = -1;
        if (songIndex > newQueue.songs.length - 1)
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(`${client.allEmojis.x} **This song does not exist!**`)
                .setDescription(
                  `**The last song in the queue has the index: \`${newQueue.songs.length}\`**`
                ),
            ],
            ephemeral: true,
          });
        if (position == 0)
          return interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setTitle(
                  `${client.allEmojis.x} **Cannot move song before playing song!**`
                ),
            ],
            ephemeral: true,
          });
        let song = newQueue.songs[songIndex];
        //remove the song
        newQueue.songs.splice(songIndex);
        //Add it to a specific Position
        newQueue.addToQueue(song, position);
        interaction.reply({
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
