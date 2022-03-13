const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "dj", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Manages the DJ roles!", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      StringChoices: {
        name: "method",
        description: "What do you want to do?",
        required: true,
        choices: [
          ["Add Dj-Role", "add"],
          ["Remove Dj-Role", "remove"],
        ],
      },
    },
    {
      Role: {
        name: "role",
        description: "What role do you want to add or remove?",
        required: true,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, options } = interaction;
      const { guild } = member;
      let add_remove = options.getString("what_to_do");
      let Role = options.getRole("which_role");
      client.settings.ensure(guild.id, {
        djroles: [],
      });
      if (add_remove == "add") {
        if (client.settings.get(guild.id, "djroles").includes(Role.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **This role is already a DJ role!**`
                ),
            ],
          });
        }
        client.settings.push(guild.id, Role.id, "djroles");
        var djs = client.settings
          .get(guild.id, `djroles`)
          .map((r) => `<@&${r}>`);
        if (djs.length == 0) djs = "`not setup`";
        else djs.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.check_mark} **The role \`${
                  Role.name
                }\` has been added to the ${
                  client.settings.get(guild.id, "djroles").length - 1
                } DJ roles!**`
              )
              .addField(
                `🎧 **DJ role${
                  client.settings.get(guild.id, "djroles").length > 1 ? "s" : ""
                }:**`,
                `>>> ${djs}`,
                true
              ),
          ],
        });
      } else {
        if (!client.settings.get(guild.id, "djroles").includes(Role.id)) {
          return interaction.reply({
            ephemeral: true,
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.x} **This role is not a DJ role yet!**`
                ),
            ],
          });
        }
        client.settings.remove(guild.id, Role.id, "djroles");
        var djs = client.settings
          .get(guild.id, `djroles`)
          .map((r) => `<@&${r}>`);
        if (djs.length == 0) djs = "`not setup`";
        else djs.join(", ");
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.check_mark} **The role \`${
                  Role.name
                }\` has been removed from the ${
                  client.settings.get(guild.id, "djroles").length
                } DJ roles!**`
              )
              .addField(
                `🎧 **DJ role${
                  client.settings.get(guild.id, "djroles").length > 1 ? "s" : ""
                }:**`,
                `>>> ${djs}`,
                true
              ),
          ],
        });
      }
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
