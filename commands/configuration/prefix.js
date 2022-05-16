const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "prefix",
  description: "Change the prefix for your server.",
  aliases: [
    "setprefix",
    "set-prefix",
    "changeprefix",
    "change-prefix",
    "setup-prefix",
    "setupprefix",
  ],
  usage: "<new prefix>",
  userPerms: ["MANAGE_GUILD"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    if (!args[0])
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to specify the new prefix!`)
            .setColor("RED"),
        ],
      });
    if (args[0].length > 5)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The new prefix must be less than 5 characters!`
            )
            .setColor("RED"),
        ],
      });
    client.settings.ensure(message.guild.id, {
      prefix: client.config.prefix,
    });
    if (args[0] === client.config.prefix || args[0] === "reset") {
      client.settings.set(message.guild.id, client.config.prefix, "prefix");

      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.check} Successfully reset the prefix to \`${client.config.prefix}\``
            )
            .setColor(client.config.color),
        ],
      });
    }

    client.settings.set(message.guild.id, args[0], "prefix");

    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Successfully set the prefix to \`${args[0]}\``
          )
          .setColor(client.config.color),
      ],
    });
  },
};
