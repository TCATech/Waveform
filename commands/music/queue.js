const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

module.exports = {
  name: "queue",
  description: "Shows the queue of the server.",
  aliases: ["q", "que", "queu", "list"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guild, guildId } = message;
    const { channel } = member.voice;
    if (!channel)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to be in a voice channel!`)
            .setColor("RED"),
        ],
      });

    if (
      guild.me.voice.channel &&
      guild.me.voice.channel.id !== member.voice.channel.id
    )
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You need to be in __my__ voice channel!`
            )
            .setDescription(
              "Join my voice channel: <#" + guild.me.voice.channel.id + ">"
            )
            .setColor("RED"),
        ],
      });

    let newQueue = client.distube.getQueue(guildId);
    if (!newQueue || !newQueue.songs || newQueue.songs.length === 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} I'm not playing anything right now!`)
            .setColor("RED"),
        ],
      });
    let embeds = [];
    let k = 10;
    let theSongs = newQueue.songs;
    for (let i = 0; i < theSongs.length; i += 10) {
      let qus = theSongs;
      const current = qus.slice(i, k);
      let j = i;
      const info = current
        .map(
          (track) =>
            `**${j++}.** [\`${String(track.name)}\`](${track.url}) - \`${
              track.formattedDuration
            }\``
        )
        .join("\n");
      const embed = new MessageEmbed()
        .setTitle(`📑 **Queue of ${guild.name}**`)
        .setColor(client.config.color)
        .setDescription(`${info}`)
        .setFooter({
          text: `\n${theSongs.length - 1} songs in the queue | Duration: ${
            newQueue.formattedDuration
          }`,
          iconURL: guild.iconURL({ dynamic: true }),
        });
      if (i < 10) {
        embed.setDescription(
          `**Current song:**\n> [\`${theSongs[0].name}\`](${theSongs[0].url})\n\n${info}`
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
          .setEmoji(client.emotes.previouspage)
          .setDisabled(pages[id] === 0),
        new MessageButton()
          .setCustomId("next")
          .setStyle("SECONDARY")
          .setEmoji(client.emotes.nextpage)
          .setDisabled(pages[id] === embeds.length - 1),
        new MessageButton()
          .setCustomId("delete")
          .setStyle("DANGER")
          .setEmoji("🗑")
      );

      return row;
    };
    const reply = await message.reply({
      embeds: [embeds[0]],
      components: [getRow(id)],
    });
    const filter = (i) => i.user.id === member.id && i.message.id === reply.id;
    const collector = message.channel.createMessageComponentCollector({
      filter,
    });

    collector.on("collect", (i) => {
      if (!i) return;

      i.deferUpdate();

      if (
        i.customId !== "prev" &&
        i.customId !== "next" &&
        i.customId !== "delete"
      )
        return;

      if (i.customId === "prev" && pages[id] > 0) {
        --pages[id];
        reply.edit({
          embeds: [embeds[pages[id]]],
          components: [getRow(id)],
        });
      } else if (i.customId === "next" && pages[id] < embeds.length - 1) {
        ++pages[id];
        reply.edit({
          embeds: [embeds[pages[id]]],
          components: [getRow(id)],
        });
      } else if (i.customId === "delete") {
        reply.delete();
        message.delete();
      }
    });
  },
};
