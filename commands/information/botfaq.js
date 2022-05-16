const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "botfaq",
  description: "Have some questions about {botname}? We have some answers.",
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    const embed = new MessageEmbed()
      .setAuthor({
        name: "Bot FAQ",
        iconURL: client.user.displayAvatarURL({ format: "png", dynamic: true }),
      })
      .setDescription(
        "***Select what you what you want to know using the `dropdown menu` below!***"
      )
      .setColor(client.config.color);

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("botfaq")
        .setPlaceholder("Select something!")
        .addOptions(
          {
            label: "Creator",
            value: "creator",
            emoji: "⌨",
            description: "Who made this bot?",
          },
          {
            label: "Stats",
            value: "stats",
            emoji: "📊",
            description: "Some cool stats about the bot.",
          },
          {
            label: "Support",
            value: "support",
            emoji: "💸",
            description: "How to support the creator/developers of this bot.",
          }
        )
        .setDisabled(false)
    );

    message.reply({
      embeds: [embed],
      components: [row],
    });

    const filter = (int) => int.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({
      filter,
      componentType: "SELECT_MENU",
    });

    collector.on("collect", (int) => {
      switch (int.values[0]) {
        case "creator":
          {
            int.reply({
              embeds: [
                embed.setDescription(`
                **I was made by __TCA Tech__!**
                > [Their GitHub](https://github.com/TCATech)
                > [Their website](https://tcatech.ml)
                > [Their Discord server](https://discord.gg/t7e48xn5Nq)
                
                **I was mainly coded by \`Not TCA#6651\` and \`kiran#1000\`, so if you have any issues with the bot contact them!**`),
              ],
              ephemeral: true,
            });
          }
          break;
        case "stats":
          {
            int.reply({
              embeds: [
                embed.setDescription(`
                    __**📈 Stats!**__
                    > ⚙ **\`${client.commands.map((a) => a).length}\` commands**
                    > 📁 Watching **${client.guilds.cache.size} servers**
                    > ⏰ **I have been online for \`${ms(client.uptime, {
                      long: true,
                    })}\`**
                    > 📶 **\`${client.ws.ping}ms\` Ping**
                    `),
              ],
              ephemeral: true,
            });
          }
          break;

        case "support":
          {
            int.reply({
              embeds: [
                embed.setDescription(`
__**You can support TCA Tech through the following methods:**__

> <:Patreon:970681106082955294> **Patreon:** https://patreon.com/NotTCA
                    
__**You don't need to donate though, you can support TCA Tech by just doing things like:**__

> <:Discord:970681425672151072> **Joining their Discord server:** https://discord.gg/t7e48xn5Nq

> <:add:974987762459619378> **Adding me to your server:** https://waveform.cf/invite
                `),
              ],
              ephemeral: true,
            });
          }
          break;
      }
    });
  },
};
