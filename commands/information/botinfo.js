const {
  Client,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} = require("discord.js");

module.exports = {
  name: "botinfo",
  description: "Tells you some info about {botname}.",
  aliases: ["bi", "bot"],
  /**
   *
   * @param {Client} client
   * @param {Message} message
   */
  run: async (client, message) => {
    const embed = new MessageEmbed()
      .setAuthor({
        name: client.user.tag,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .addField(
        "Servers watching",
        `${client.guilds.cache.size.toLocaleString()} server${
          client.guilds.cache.size > 1 ? "s" : ""
        }`,
        true
      )
      .addField(
        "Channels watching",
        client.channels.cache.size.toLocaleString(),
        true
      )
      .addField("Users watching", client.users.cache.size.toString(), true)
      .addField("Commands", client.commands.size.toLocaleString(), true)
      .addField("Prefix", `\`${message.prefix}\``, true)
      .addField(
        "Made with",
        `[discord.js](https://github.com/discordjs/discord.js)`,
        true
      )
      .addField("Version", client.config.version, true)
      .addField(
        "Created on",
        `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
        true
      )
      .addField("Developers", "Not TCA#6651 & kiran#1000", true)
      .setColor(client.config.color);

    message.reply({
      embeds: [embed],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle("LINK")
            .setLabel("Invite")
            .setEmoji("974987762459619378")
            .setURL("https://waveform.cf/invite")
        ),
      ],
    });
  },
};
