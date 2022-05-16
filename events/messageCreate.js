const { MessageEmbed } = require("discord.js");
const client = require("../index");
const { escapeRegex } = require("../utils/functions");

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  client.settings.ensure(message.guild.id, {
    prefix: client.config.prefix,
    defaultVolume: 50,
    defaultFilters: ["clear", "bassboost6"],
    djRoles: [],
  });

  message.prefix = client.settings.get(message.guild.id, "prefix");

  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(message.prefix)})\\s*`
  );
  if (!prefixRegex.test(message.content)) return;

  const [, mPrefix] = message.content.match(prefixRegex);

  const [cmd, ...args] = message.content
    .slice(mPrefix.length)
    .trim()
    .split(/ +/);

  if (cmd.length === 0) {
    if (mPrefix.includes(client.user.id)) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              "👋 My prefix for this server is: `" + message.prefix + "`"
            )
            .setDescription(
              "Use `" + message.prefix + "help` to see all commands."
            )
            .setColor(client.config.color),
        ],
      });
    }
  }

  const command =
    client.commands.get(cmd.toLowerCase()) ||
    client.commands.find((c) => c.aliases?.includes(cmd.toLowerCase()));

  if (!command) return;

  try {
    if (
      command.userPerms &&
      !message.member.permissions.has(command.userPerms)
    ) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${client.emotes.x} You do not have permission to use this command.`
            )
            .setDescription(
              `You need to obtain the following permissions: \`${command.userPerms
                .map(
                  (value) =>
                    `${
                      value[0].toUpperCase() +
                      value
                        .toLowerCase()
                        .slice(1)
                        .replace(/_/gi, " ")
                        .replace("guild", "server")
                    }`
                )
                .join(", ")}\``
            )
            .setColor(client.config.color),
        ],
      });
    }

    if (
      command.botPerms &&
      !message.guild.me.permissions.has(command.botPerms)
    ) {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${client.emotes.x} I do not have enough permissions`)
            .setDescription(
              `Kindly give me the following permissions: \`${command.botPerms
                .map(
                  (value) =>
                    `${
                      value[0].toUpperCase() +
                      value.toLowerCase().slice(1).replace(/_/gi, " ")
                    }`
                )
                .join(", ")}\``
            )
            .setColor(client.config.color),
        ],
      });
    }

    await command.run(client, message, args);
  } catch (err) {
    console.log(err);
    message.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`${client.emotes.x} An error has occured.`)
          .setDescription(`\`\`\`${err}\`\`\``)
          .setColor(client.config.color),
      ],
    });
  }
});
