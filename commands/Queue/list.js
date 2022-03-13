const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const { check_if_dj } = require("../../handlers/functions");
module.exports = {
  name: "list", //the command name for the Slash Command

  category: "Queue",
  aliases: ["list", "queue", "queuelist"],
  usage: "list",

  description: "Lists the current queue.", //the command description for Slash Command Overview
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
        let embeds = [];
        let k = 10;
        let theSongs = newQueue.songs;
        //defining each Pages
        for (let i = 0; i < theSongs.length; i += 10) {
          let qus = theSongs;
          const current = qus.slice(i, k);
          let j = i;
          const info = current
            .map(
              (track) =>
                `**${j++} -** [\`${String(track.name)
                  .replace(/\[/giu, "{")
                  .replace(/\]/giu, "}")
                  .substr(0, 60)}\`](${track.url}) - \`${
                  track.formattedDuration
                }\``
            )
            .join("\n");
          const embed = new MessageEmbed()
            .setTitle(`📑 **Queue of ${guild.name}**`)
            .setColor(ee.color)
            .setDescription(`${info}`)
            .setFooter(
              `\n${theSongs.length - 1} songs in the queue | Duration: ${
                newQueue.formattedDuration
              }`,
              ee.footericon
            );
          if (i < 10) {
            embed.setDescription(
              `**Current Song:**\n> [\`${theSongs[0].name
                .replace(/\[/giu, "{")
                .replace(/\]/giu, "}")}\`](${theSongs[0].url})\n\n${info}`
            );
          }
          embeds.push(embed);
          k += 10; //Raise k to 10
        }
        let pages = {};
        const id = member.id;
        pages[id] = 0;
        const getRow = (id) => {
          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("prev")
              .setStyle("SECONDARY")
              .setEmoji("<:previous:950307672446603304>")
              .setDisabled(pages[id] === 0),
            new MessageButton()
              .setCustomId("next")
              .setStyle("SECONDARY")
              .setEmoji("<:next:950307682928173066>")
              .setDisabled(pages[id] === embeds.length - 1)
          );

          return row;
        };
        const reply = await message.reply({
          embeds: [embeds[0]],
          components: [getRow(id)],
        });
        //Event
        // client.on("interactionCreate", (i) => {
        //   if (!i.isButton()) return;
        //   if (i.customId === "PAGES" && i.applicationId == client.user.id) {
        //     interaction
        //       .reply({
        //         embeds: pages[Number(i.values[0])],
        //         ephemeral: true,
        //       })
        //       .catch((e) => {});
        //   }
        // });

        //Collector
        const filter = (i) => i.user.id === member.id;
        const collector = message.channel.createMessageComponentCollector({
          filter,
        });

        collector.on("collect", (i) => {
          if (!i) return;

          i.deferUpdate();

          if (i.customId !== "prev" && i.customId !== "next") return;

          if (i.customId === "prev" && pages[id] > 0) {
            --pages[id];
          } else if (i.customId === "next" && pages[id] < embeds.length - 1) {
            ++pages[id];
          }

          reply.edit({
            embeds: [embeds[pages[id]]],
            components: [getRow(id)],
          });
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
