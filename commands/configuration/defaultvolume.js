const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "defaultvolume",
  description: "Sets the default volume for your server.",
  aliases: ["dvolume"],
  usage: "<new volume>",
  userPerms: ["MANAGE_GUILD"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { member, guild, guildId } = message;
    const { channel } = member.voice;

    if (!args[0])
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to specify the new volume!`)
            .setColor("RED"),
        ],
      });

    const volume = parseInt(args[0]);
    if (isNaN(volume))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} The new volume must be a number!`)
            .setColor("RED"),
        ],
      });

    if (volume > 100 || volume < 0)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} The volume must be between 0 and 100!`
            )
            .setColor("RED"),
        ],
      });

    client.settings.set(guildId, volume, "defaultVolume");

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} The new default volume is now \`${volume}\`!`
          )
          .setColor("RED"),
      ],
    });
  },
};
