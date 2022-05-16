const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  name: "removedj",
  description: "Adds a DJ role to the server.",
  usage: "<@role or role ID>",
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const { mentions, guild } = message;
    let role = mentions.roles.first() || guild.members.cache.get(args[0]);

    if (!role)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} You need to specify a role!`)
            .setColor("RED"),
        ],
      });

    if (!client.settings.get(guild.id, "djRoles").includes(role.id))
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} This role is not a DJ role!`)
            .setColor(client.config.color),
        ],
      });

    client.settings.remove(guild.id, role.id, "djRoles");
    var djs = client.settings.get(guild.id, `djRoles`).map((r) => `<@&${r}>`);
    if (djs.length == 0) djs = "`None`";
    else djs.join(", ");

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(
            `${client.emotes.check} Successfully removed ${role.name} from the DJ roles!`
          )
          .addField(`🎧 All DJ roles:`, djs.toString())
          .setColor(client.config.color),
      ],
    });
  },
};
