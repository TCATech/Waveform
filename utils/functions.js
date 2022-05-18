module.exports = {
  escapeRegex: function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  },
  check_dj: function check_dj(client, member, song) {
    if (!client) return false;
    const roleId = client.settings.get(member.guild.id, "djRoles");
    if (String(roleId) === "") return false;

    var isDJ = false;

    for (let i = 0; i < roleId.length; i++) {
      if (!member.guild.roles.cache.get(roleId[i])) continue;
      if (member.roles.cache.has(roleId[i])) isDJ = true;
    }

    if (
      !isDJ &&
      !member.permissions.has("ADMINISTRATOR") &&
      song.user.id !== member.id
    )
      return roleId.map((i) => `<@&${i}>`).join(", ");
  },
  onCoolDown: function onCoolDown(message, command) {
    if (!message || !message.client)
      throw "No message with a valid client given.";
    if (!command || !command.name) throw "No command with a valid name given.";
    const client = message.client;
    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount =
      (command.cooldown || settings.default_cooldown_in_sec) * 1000;
    if (timestamps.has(message.member.id)) {
      const expirationTime = timestamps.get(message.member.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return timeLeft;
      } else {
        timestamps.set(message.member.id, now);
        setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
        return false;
      }
    } else {
      timestamps.set(message.member.id, now);
      setTimeout(() => timestamps.delete(message.member.id), cooldownAmount);
      return false;
    }
  },

  getTime: function getTime() {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ::`;
  },
};
