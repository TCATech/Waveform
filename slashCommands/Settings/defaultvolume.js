const { MessageEmbed } = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "defaultvolume", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Defines the default volume of the bot!", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      Integer: {
        name: "volume",
        description:
          "What should be the new default volume? It must be between 0 & 150.",
        required: true,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const { member, options } = interaction;
      const { guild } = member;
      let volume = options.getInteger("volume");
      client.settings.ensure(guild.id, {
        defaultvolume: 50,
      });

      if (!volume || volume > 150 || volume < 1) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            new MessageEmbed()
              .setColor(ee.wrongcolor)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(
                `${client.allEmojis.x} **The volume __must__ be between \`1\` and \`150\`!**`
              ),
          ],
        });
      }
      client.settings.set(guild.id, volume, "defaultvolume");
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(ee.color)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(
              `${client.allEmojis.check_mark} **The default volume has been set to: \`${volume}\`!**`
            ),
        ],
      });
    } catch (e) {
      console.log(String(e.stack).bgRed);
    }
  },
};
