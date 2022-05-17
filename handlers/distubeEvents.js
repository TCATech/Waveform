const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const config = require("../botconfig/config.json");
const PlayerMap = new Map();
let songEditInterval = null;
const { check_dj } = require("../utils/functions");

module.exports = (client) => {
  client.distube
    .on("initQueue", (queue) => {
      if (PlayerMap.has(`deleted-${queue.id}`)) {
        PlayerMap.delete(`deleted-${queue.id}`);
      }
      client.settings.ensure(queue.id, {
        defaultVolume: 50,
        defaultFilters: ["clear", "bassboost6"],
      });
      let data = client.settings.get(queue.id);
      queue.volume = Number(data.defaultVolume);
      queue.setFilter(data.defaultFilters);
    })
    .on("playSong", async (queue, track) => {
      try {
        if (!client.guilds.cache.get(queue.id).me.voice.deaf)
          client.guilds.cache
            .get(queue.id)
            .me.voice.setDeaf(true)
            .catch((e) => {
              //console.log(e.stack ? String(e.stack).grey : String(e).grey)
            });
      } catch (error) {
        console.log(error);
      }
      try {
        var newQueue = client.distube.getQueue(queue.id);
        var data = receiveQueueData(newQueue, track);
        let currentSongPlayMsg = await queue.textChannel
          .send(data)
          .then((msg) => {
            PlayerMap.set(`currentmsg`, msg.id);
            return msg;
          });

        var collector = currentSongPlayMsg.createMessageComponentCollector({
          filter: (i) =>
            i.isButton() && i.user && i.message.author.id == client.user.id,
          time: track.duration > 0 ? track.duration * 1000 : 600000,
        });

        let lastEdited = false;

        try {
          clearInterval(songEditInterval);
        } catch (e) {}
        songEditInterval = setInterval(async () => {
          if (!lastEdited) {
            try {
              var newQueue = client.distube.getQueue(queue.id);
              var data = receiveQueueData(newQueue, newQueue.songs[0]);
              await currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              });
            } catch (e) {
              clearInterval(songEditInterval);
            }
          }
        }, 10000);

        collector.on("collect", async (i) => {
          lastEdited = true;
          setTimeout(() => {
            lastEdited = false;
          }, 7000);
          let { member } = i;
          const { channel } = member.voice;
          client.settings.ensure(member.id, {
            favorites: [],
          });

          if (i.customId !== "Favorite" && !channel)
            return i.reply({
              embeds: [
                new MessageEmbed()
                  .setTitle("❌ You need to be in a voice channel!")
                  .setColor("RED"),
              ],
              ephemeral: true,
            });

          const queue = client.distube.getQueue(i.guild.id);
          if (
            i.customId !== "Favorite" &&
            (!queue || !newQueue.songs || newQueue.songs.length == 0)
          ) {
            return i.reply({
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setTitle(`❌ There is currently nothing playing.`),
              ],
              ephemeral: true,
            });
          }

          if (
            i.customId !== "Favorite" &&
            channel.id !== newQueue.voiceChannel.id
          )
            return i.reply({
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setTitle("❌ You need to be in __my__ voice channel!")
                  .setDescription(
                    "Join my voice channel: <#" +
                      guild.me.voice.channel.id +
                      ">"
                  ),
              ],
              ephemeral: true,
            });

          if (
            i.customId !== "Favorite" &&
            check_dj(client, member, newQueue.songs[0])
          )
            return i.reply({
              embeds: [
                new MessageEmbed()
                  .setColor("RED")
                  .setTitle(`❌ You are not a DJ, or the song requester!`),
              ],
              ephemeral: true,
            });

          switch (i.customId) {
            case "Previous":
              {
                await client.distube.previous(i.guild.id);
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(`⏮️ Now playing the previous played track!`),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "Pause":
              {
                if (newQueue.playing) {
                  await client.distube.pause(i.guild.id);
                  var data = receiveQueueData(
                    client.distube.getQueue(newQueue.id),
                    newQueue.songs[0]
                  );
                  currentSongPlayMsg.edit(data).catch((e) => {
                    //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                  });
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(`⏸ Paused!`),
                    ],
                    ephemeral: true,
                  });
                } else {
                  await client.distube.resume(i.guild.id);
                  var data = receiveQueueData(
                    client.distube.getQueue(newQueue.id),
                    newQueue.songs[0]
                  );
                  currentSongPlayMsg.edit(data).catch((e) => {
                    //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                  });
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(`▶️ Resumed!`),
                    ],
                    ephemeral: true,
                  });
                }
              }
              break;
            case "Next":
              {
                await client.distube.skip(i.guild.id);
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(`⏭ Skipped!`),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "Stop":
              {
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(
                        `⏹ Stopped playing and left the voice channel.`
                      ),
                  ],
                  ephemeral: true,
                });
                await client.distube.stop(i.guild.id);
              }
              break;
            case "Shuffle":
              {
                if (client.maps.has(`beforeshuffle-${newQueue.id}`)) {
                  newQueue.songs = [
                    newQueue.songs[0],
                    ...client.maps.get(`beforeshuffle-${newQueue.id}`),
                  ];
                  client.maps.delete(`beforeshuffle-${newQueue.id}`);
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(
                          `🔀 Unshuffled ${newQueue.songs.length} songs!`
                        ),
                    ],
                    ephemeral: true,
                  });
                } else {
                  client.maps.set(
                    `beforeshuffle-${newQueue.id}`,
                    newQueue.songs.map((track) => track).slice(1)
                  );
                  await newQueue.shuffle();
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(
                          `🔀 Shuffled ${newQueue.songs.length} songs!`
                        ),
                    ],
                    ephemeral: true,
                  });
                }
              }
              break;
            case "Loop":
              {
                let loopMode = "";
                newQueue.setRepeatMode();
                switch (newQueue.repeatMode) {
                  case 0:
                    {
                      loopMode = "Off";
                    }
                    break;
                  case 1:
                    {
                      loopMode = "Song";
                    }
                    break;
                  case 2:
                    {
                      loopMode = "Queue";
                    }
                    break;
                }
                var data = receiveQueueData(
                  client.distube.getQueue(newQueue.id),
                  newQueue.songs[0]
                );
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                });
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(`🔁 Set loop mode to ${loopMode}!`),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "Favorite":
              {
                let favorites = client.settings.get(member.id, "favorites");
                if (favorites.includes(track.name)) {
                  client.settings.remove(member.id, track.name, "favorites");
                  favorites = client.settings.get(member.id, "favorites");
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(`💔 Removed from favorites!`),
                    ],
                    ephemeral: true,
                  });
                } else {
                  client.settings.push(member.id, track.name, "favorites");
                  favorites = client.settings.get(member.id, "favorites");
                  i.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor(config.color)
                        .setTitle(`♥ Added to favorites!`),
                    ],
                    ephemeral: true,
                  });
                }
              }
              break;
            case "Forward":
              {
                let seektime = newQueue.currentTime + 10;
                if (seektime >= newQueue.songs[0].duration)
                  seektime = newQueue.songs[0].duration - 1;
                await newQueue.seek(Number(seektime));
                collector.resetTimer({
                  time:
                    (newQueue.songs[0].duration - newQueue.currentTime) * 1000,
                });
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(
                        `⏩ Seeked to \`${newQueue.formattedCurrentTime}\`!`
                      ),
                  ],
                  ephemeral: true,
                });
                var data = receiveQueueData(
                  client.distube.getQueue(newQueue.id),
                  newQueue.songs[0]
                );
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                });
              }
              break;
            case "Rewind":
              {
                let seektime = newQueue.currentTime - 10;
                if (seektime < 0) seektime = 0;
                if (
                  seektime >=
                  newQueue.songs[0].duration - newQueue.currentTime
                )
                  seektime = 0;
                await newQueue.seek(Number(seektime));
                collector.resetTimer({
                  time:
                    (newQueue.songs[0].duration - newQueue.currentTime) * 1000,
                });
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(config.color)
                      .setTitle(
                        `⏪ Rewinded to \`${newQueue.formattedCurrentTime}\`!`
                      ),
                  ],
                  ephemeral: true,
                });
              }
              break;
          }
        });
      } catch (err) {
        console.log(err);
      }
    })
    .on(`addList`, (queue, playlist) => {
      queue.textChannel.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.color)
            .setThumbnail(
              playlist.thumbnail.url
                ? playlist.thumbnail.url
                : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`
            )
            .setFooter({
              text: "Requested by: " + playlist.user.tag,
              iconURL: playlist.user.displayAvatarURL({
                dynamic: true,
              }),
            })
            .setTitle(`${client.emotes.check} Playlist added to the queue!`)
            .setDescription(
              `👍 Playlist: [\`${playlist.name}\`](${
                playlist.url ? playlist.url : ``
              })  -  \`${playlist.songs.length} song${
                playlist.songs.length > 0 ? `s` : ``
              }\``
            )
            .addField(
              `⌛ Estimated Time:`,
              `\`${queue.songs.length - -playlist.songs.length} song${
                queue.songs.length > 0 ? `s` : ``
              }\` - \`${(
                Math.floor(((queue.duration - playlist.duration) / 60) * 100) /
                100
              )
                .toString()
                .replace(`.`, `:`)}\``,
              true
            )
            .addField(
              `🌀 Queue Duration:`,
              `\`${queue.formattedDuration}\``,
              true
            ),
        ],
      });
    })
    .on(`finishSong`, (queue, song) => {
      var embed = new MessageEmbed()
        .setColor(config.color)
        .setAuthor({
          name: `${song.name}`,
          iconURL: `https://media.discordapp.net/attachments/974995921572098058/974995935799177266/unknown.png`,
          url: song.url,
        })
        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
        .setFooter({
          text: `👍 SONG ENDED!`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });
      queue.textChannel.messages
        .fetch(PlayerMap.get(`currentmsg`))
        .then((currentSongPlayMsg) => {
          currentSongPlayMsg
            .edit({ embeds: [embed], components: [] })
            .catch((e) => {
              //console.log(e.stack ? String(e.stack).grey : String(e).grey)
            });
          PlayerMap.delete(`currentmsg`);
        })
        .catch((e) => {
          //console.log(e.stack ? String(e.stack).grey : String(e).grey)
        });
    })
    .on("deleteQueue", (queue) => {
      if (!PlayerMap.has(`deleted-${queue.id}`)) {
        PlayerMap.set(`deleted-${queue.id}`, true);
        queue.textChannel.send({
          embeds: [
            new MessageEmbed()
              .setColor(config.color)
              .setTitle(`🗑️ Queue has been deleted!`)
              .setDescription(
                `This might have happened because the voice channel was empty, the bot was kicked from the voice channel, it was stopped by someone, or the queue ended.`
              ),
          ],
        });
      }
    })
    .on(`error`, (channel, e) => {
      channel
        .send({
          embeds: [
            new MessageEmbed()
              .setTitle(`${client.emotes.x} An error has occured.`)
              .setDescription(`\`\`\`${e}\`\`\``)
              .setColor(client.config.color),
          ],
        })
        .catch((e) => console.log(e));
      console.log(e.black.bgRed);
    });

  function receiveQueueData(newQueue, newTrack) {
    client.settings.ensure(newQueue.id, {
      djRoles: [],
    });
    var djs = client.settings.get(newQueue.id, `djRoles`);
    if (!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map((r) => `<@&${r}>`);
    if (djs.length == 0) djs = `\`None\``;
    else djs.slice(0, 15).join(`, `);
    if (!newQueue || !newTrack) return;
    var embed = new MessageEmbed()
      .setColor(config.color)
      .setAuthor({
        name: `${newTrack.name}`,
        iconURL: `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`,
        url: newTrack.url,
      })
      .addField(`💡 Requested by:`, `>>> ${newTrack.user}`, true)
      .addField(
        `💻 Posted by:`,
        `>>> [${newTrack.uploader.name}](${newTrack.uploader.url})`,
        true
      )
      .addField(
        `⏱ Duration:`,
        `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``,
        true
      )
      .addField(`🔊 Volume:`, `>>> \`${newQueue.volume}%\``, true)
      .addField(
        `♾ Loop:`,
        `>>> ${
          newQueue.repeatMode
            ? newQueue.repeatMode === 2
              ? `${client.emotes.check} \`Queue\``
              : `${client.emotes.check} \`Song\``
            : `${client.emotes.x}`
        }`,
        true
      )
      .addField("\u200b", "\u200b", true)
      .addField(
        `❔ Filter${
          newQueue.filters.length > 1 || newQueue.filters.length === 0
            ? `s`
            : ``
        }:`,
        `>>> ${
          newQueue.filters && newQueue.filters.length > 0
            ? `${newQueue.filters.map((f) => `\`${f}\``).join(`, `)}`
            : `\`None\``
        }`,
        true
      )
      .addField(
        `🎧 DJ role${
          client.settings.get(newQueue.id, `djRoles`).length > 1 ||
          client.settings.get(newQueue.id, `djRoles`).length === 0
            ? `s`
            : ``
        }:`,
        `>>> ${djs}`,
        true
      )
      .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      });
    let previous = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Previous")
      .setEmoji(client.emotes.previous);
    if (!newQueue.previousSongs || newQueue.previousSongs.length === 0) {
      previous = previous.setDisabled();
    }
    let pause = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Pause")
      .setEmoji(client.emotes.pause);
    if (!newQueue.playing) {
      pause = pause.setStyle("SUCCESS").setEmoji(client.emotes.play);
    }
    let next = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Next")
      .setEmoji(client.emotes.next);
    if (newQueue.songs.length <= 1) {
      next = next.setDisabled();
    }
    let stop = new MessageButton()
      .setStyle("DANGER")
      .setCustomId("Stop")
      .setEmoji(client.emotes.stop);
    let shuffle = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Shuffle")
      .setEmoji(client.emotes.shuffle);
    let loop = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Loop")
      .setEmoji(client.emotes.loop);

    if (newQueue.repeatMode) {
      switch (newQueue.repeatMode) {
        case 0:
          {
            loop = loop.setStyle("SECONDARY");
          }
          break;
        case 1:
          {
            loop = loop.setStyle("SUCCESS").setEmoji(client.emotes.loopsong);
          }
          break;
        case 2:
          {
            loop = loop.setStyle("SUCCESS");
          }
          break;
      }
    }
    let favorite = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Favorite")
      .setEmoji(client.emotes.favorite);
    let forward = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Forward")
      .setEmoji(client.emotes.forward)
      .setLabel(`+10s`);
    let rewind = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("Rewind")
      .setEmoji(client.emotes.rewind)
      .setLabel(`-10s`);
    if (Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled();
    } else {
      rewind = rewind.setDisabled(false);
    }
    if (Math.floor(newTrack.duration - newQueue.currentTime) <= 10) {
      forward = forward.setDisabled();
    } else {
      forward = forward.setDisabled(false);
    }
    const row = new MessageActionRow().addComponents([
      previous,
      pause,
      next,
      stop,
      shuffle,
    ]);
    const row2 = new MessageActionRow().addComponents([
      loop,
      favorite,
      forward,
      rewind,
    ]);
    return {
      embeds: [embed],
      components: [row, row2],
    };
  }
};
