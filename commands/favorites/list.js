const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

module.exports = {
  name: "favorites",
  description: "Lists all of your favorite songs.",
  aliases: ["favorite", "favourites", "favourite", "favs", "fav", "f"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { guildId, channelId, member } = message;
    const user =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;
    client.settings.ensure(user.id, {
      favorites: [],
    });
    if (client.settings.get(user.id, "favorites").length === 0) {
      const embed = new MessageEmbed()
        .setTitle(
          `${client.emotes.x} ${
            user === message.member ? "You don't" : "That user doesn't"
          } have any favorites!`
        )
        .setColor("RED");
      if (user === message.member)
        embed.setDescription(
          "You can add some by doing `" +
            message.prefix +
            "addfav [song name or url]`, or by clicking the heart button when playing a song!"
        );
      return message.reply({
        embeds: [embed],
      });
    }
    let embeds = [];
    let k = 10;
    let theSongs = client.settings.get(user.id, "favorites");
    for (let i = 0; i < theSongs.length; i += 10) {
      const current = theSongs.slice(i, k);
      let j = i + 1;
      const info = current
        .map((track) => `**${j++}.** \`${track}\``)
        .join("\n");
      const embed = new MessageEmbed()
        .setTitle(`💖 **Favorites of ${user.user.tag}**`)
        .setColor(client.config.color)
        .setDescription(`${info}`)
        .setFooter({
          text: `${theSongs.length} songs favorited`,
          iconURL: user.user.displayAvatarURL({ dynamic: true }),
        });
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
