const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const websiteSettings = require("../../dashboard/settings.json");
module.exports = {
  name: "help", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "RReturns all commands, or info for one command.", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      String: {
        name: "command",
        description: "What command do you want to get info from?",
        required: false,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, options } = interaction;
      const { guild } = member;
      let prefix = client.settings.get(guild.id, "prefix");
      let args = options.getString("specific_cmd");
      if (args && args.length > 0) {
        const embed = new MessageEmbed();
        const cmd =
          client.commands.get(args.toLowerCase()) ||
          client.commands.get(client.aliases.get(args.toLowerCase()));
        if (!cmd) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              embed
                .setColor(ee.wrongcolor)
                .setDescription(
                  `No information found for command **${args.toLowerCase()}**`
                ),
            ],
          });
        }
        if (cmd.name) embed.addField("**Command name**", `\`${cmd.name}\``);
        if (cmd.name)
          embed.setTitle(`Detailed Information about:\`${cmd.name}\``);
        if (cmd.description)
          embed.addField("**Description**", `\`${cmd.description}\``);
        if (cmd.aliases)
          embed.addField(
            "**Aliases**",
            `\`${cmd.aliases.map((a) => `${a}`).join("`, `")}\``
          );
        if (cmd.cooldown)
          embed.addField("**Cooldown**", `\`${cmd.cooldown} Seconds\``);
        else
          embed.addField(
            "**Cooldown**",
            `\`${settings.default_cooldown_in_sec} Second\``
          );
        if (cmd.usage) {
          embed.addField("**Usage**", `\`${prefix}${cmd.usage}\``);
          embed.setFooter("Syntax: <> = required, [] = optional");
        }
        return interaction.reply({
          ephemeral: true,
          embeds: [embed.setColor(ee.color)],
        });
      } else {
        const embed = new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(client.user.displayAvatarURL())
          .setTitle("HELP MENU 🔰")
          .setDescription(
            `**[Invite me with __Slash Commands__ permissions](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands), since all of my commands are available as slash commands too.**\n\n> Check out the [**Dashboard**](${websiteSettings.website.domain}/dashboard/${message.guild.id}) or the [**Live Music Queue**](${websiteSettings.website.domain}/queue/${message.guild.id})`
          )
          .setFooter(
            `To see specific info about one command, type: ${prefix}help [CMD NAME]`,
            client.user.displayAvatarURL()
          );
        const commands = (category) => {
          return client.commands
            .filter((cmd) => cmd.category === category)
            .map((cmd) => `\`${cmd.name}\``);
        };
        try {
          for (let i = 0; i < client.categories.length; i += 1) {
            const current = client.categories[i];
            const items = commands(current);
            embed.addField(
              `**${current.toUpperCase()} [${items.length}]**`,
              `> ${items.join(", ")}`
            );
          }
        } catch (e) {
          console.log(String(e.stack).red);
        }
        interaction.reply({
          ephemeral: true,
          embeds: [embed],
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} ERROR | An error occurred`)
            .setDescription(
              `\`\`\`${
                e.message
                  ? String(e.message).substr(0, 2000)
                  : String(e).substr(0, 2000)
              }\`\`\``
            ),
        ],
      });
    }
  },
};
