const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const filters = require("../../botconfig/filters.json");
module.exports = {
  name: "defaultfilter", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 10, //the command cooldown for execution & for helpcmd [OPTIONAL]
  usage: "defaultfilter", //the command usage for helpcmd [OPTIONAL]
  description: "Defines the Default Filter(s)", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      String: {
        name: "filters",
        description: "What Filter(s) should be the Default Filters",
        required: true,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, options } = interaction;
      const { guild } = member;
      let args = options.getString("filters").split(" ");
      if (!args) args = [options.getString("filters")];
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
        defaultautoplay: false,
        defaultfilters: [`bassboost6`, `clear`],
      });
      if (args.some((a) => !filters[a])) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} **You added at least one filter that is invalid!**`
              )
              .setDescription(
                "**To define multiple filters add a SPACE (` `) in between!**"
              )
              .addField(
                "**All valid filters:**",
                Object.keys(filters)
                  .map((f) => `\`${f}\``)
                  .join(", ")
              ),
          ],
        });
      }

      client.settings.set(guild.id, args, "defaultfilters");
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(
              `${client.allEmojis.check_mark} **The new default filter${
                args.length > 1 ? "s are" : " is"
              }:**`
            )
            .setDescription(`${newfilters}`),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
