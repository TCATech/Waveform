const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const filters = require("../../botconfig/filters.json");
module.exports = {
  name: "defaultfilter", //the command name for execution & for helpcmd [OPTIONAL]
  aliases: ["dfilter"],
  category: "Settings",
  usage: "defaultfilter <filter1 filter2 etc.>",
  cooldown: 10, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Defines the default filter(s)", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL], //Only allow specific Users to execute a Command [OPTIONAL]

  run: async (client, message, args) => {
    try {
      //things u can directly access in an interaction!
      const { member } = message;
      const { guild } = member;
      if (args.some((a) => !filters[a])) {
        return message.reply({
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
      let newfilters =
        args.length > 0
          ? args.map((a) => `\`${a}\``).join(", ")
          : `\`NOTHING\`\n> **Command usage:** \`${client.settings.get(
              guild.id,
              "prefix"
            )}defaultfilter <filter1 filter2 etc.>\``;
      return message.reply({
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
