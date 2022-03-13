console.log(
  `Welcome to SERVICE HANDLER /--/ By https://milrato.eu /--/ Discord: Tomato#6966`
    .yellow
);
const PlayerMap = new Map();
const playerintervals = new Map();
const config = require(`../botconfig/config.json`);
const settings = require(`../botconfig/settings.json`);
const ee = require(`../botconfig/embed.json`);
const DisTube = require("distube");
const {
  MessageButton,
  MessageActionRow,
  MessageEmbed,
  Permissions,
  MessageSelectMenu,
} = require(`discord.js`);
const { check_if_dj, delay, createBar } = require(`./functions`);
let songEditInterval = null;
module.exports = (client) => {
  try {
    /**
     * AUTO-RESUME-FUNCTION
     */
    const autoconnect = async () => {
      let guilds = client.autoresume.keyArray();
      if (!guilds || guilds.length == 0) return;
      for (const gId of guilds) {
        try {
          let guild = client.guilds.cache.get(gId);
          if (!guild) {
            client.autoresume.delete(gId);
            continue;
          }
          let data = client.autoresume.get(gId);

          let voiceChannel = guild.channels.cache.get(data.voiceChannel);
          if (!voiceChannel && data.voiceChannel)
            voiceChannel =
              (await guild.channels.fetch(data.voiceChannel).catch(() => {})) ||
              false;
          if (
            !voiceChannel ||
            !voiceChannel.members ||
            voiceChannel.members.filter(
              (m) => !m.user.bot && !m.voice.deaf && !m.voice.selfDeaf
            ).size < 1
          ) {
            client.autoresume.delete(gId);
            continue;
          }

          let textChannel = guild.channels.cache.get(data.textChannel);
          if (!textChannel)
            textChannel =
              (await guild.channels.fetch(data.textChannel).catch(() => {})) ||
              false;
          if (!textChannel) {
            client.autoresume.delete(gId);
            continue;
          }
          let tracks = data.songs;
          if (!tracks || !tracks[0]) {
            continue;
          }
          const makeTrack = async (track) => {
            return new DisTube.Song(
              new DisTube.SearchResult({
                duration: track.duration,
                formattedDuration: track.formattedDuration,
                id: track.id,
                isLive: track.isLive,
                name: track.name,
                thumbnail: track.thumbnail,
                type: "video",
                uploader: track.uploader,
                url: track.url,
                views: track.views,
              }),
              guild.members.cache.get(track.memberId) || guild.me,
              track.source
            );
          };
          await client.distube.playVoiceChannel(voiceChannel, tracks[0].url, {
            member: guild.members.cache.get(tracks[0].memberId) || guild.me,
            textChannel: textChannel,
          });
          let newQueue = client.distube.getQueue(guild.id);
          //tracks = tracks.map(track => makeTrack(track));
          //newQueue.songs = [newQueue.songs[0], ...tracks.slice(1)]
          for (const track of tracks.slice(1)) {
            newQueue.songs.push(await makeTrack(track));
          }
          //ADJUST THE QUEUE SETTINGS
          await newQueue.setVolume(data.volume);
          if (data.repeatMode && data.repeatMode !== 0) {
            newQueue.setRepeatMode(data.repeatMode);
          }
          if (!data.playing) {
            newQueue.pause();
          }
          await newQueue.seek(data.currentTime);
          if (data.filters && data.filters.length > 0) {
            await newQueue.setFilter(data.filters, true);
          }
          client.autoresume.delete(newQueue.id);
          console.log(
            `Autoresume`.brightCyan +
              " - Changed autoresume track to queue adjustments + deleted the database entry"
          );
          if (!data.playing) {
            newQueue.pause();
          }
          await delay(settings["auto-resume-delay"] || 1000);
        } catch (e) {
          console.log(e);
        }
      }
    };
    client.on("ready", () => {
      setTimeout(() => autoconnect(), 2 * client.ws.ping);
    });
    client.distube
      .on(`playSong`, async (queue, track) => {
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
          if (
            queue.textChannel.id ===
            client.settings.get(queue.id, `music.channel`)
          )
            return;
          //Send message with buttons
          let currentSongPlayMsg = await queue.textChannel
            .send(data)
            .then((msg) => {
              PlayerMap.set(`currentmsg`, msg.id);
              return msg;
            });
          //create a collector for the thinggy
          var collector = currentSongPlayMsg.createMessageComponentCollector({
            filter: (i) =>
              i.isButton() && i.user && i.message.author.id == client.user.id,
            time: track.duration > 0 ? track.duration * 1000 : 600000,
          }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          let lastEdited = false;

          /**
           * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
           */
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
            if (
              i.customId != `10` &&
              check_if_dj(
                client,
                i.member,
                client.distube.getQueue(i.guild.id).songs[0]
              )
            ) {
              return i
                .reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(ee.wrongcolor)
                      .setFooter(ee.footertext, ee.footericon)
                      .setTitle(
                        `${client.allEmojis.x} **You are not a DJ, nor the song requester!**`
                      )
                      .setDescription(
                        `**DJ roles:**\n${check_if_dj(
                          client,
                          i.member,
                          client.distube.getQueue(i.guild.id).songs[0]
                        )}`
                      ),
                  ],
                  ephemeral: true,
                })
                .then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
            }
            lastEdited = true;
            setTimeout(() => {
              lastEdited = false;
            }, 7000);
            let { member } = i;
            //get the channel instance from the Member
            const { channel } = member.voice;
            //if the member is not in a channel, return
            if (!channel)
              return i
                .reply({
                  content: `${client.allEmojis.x} **Please join a voice channel first!**`,
                  ephemeral: true,
                })
                .then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
            //get the player instance
            const queue = client.distube.getQueue(i.guild.id);
            //if no player available return aka not playing anything
            if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
              return i
                .reply({
                  content: `${client.allEmojis.x} **Nothing currently playing.**`,
                  ephemeral: true,
                })
                .then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
            }
            //if not in the same channel as the player, return Error
            if (channel.id !== newQueue.voiceChannel.id)
              return i
                .reply({
                  content: `${client.allEmojis.x} **Please join __my__ voice channel first! <#${channel.id}>**`,
                  ephemeral: true,
                })
                .then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
            if (i.customId == `1`) {
              //if ther is nothing more to skip then stop music and leave the Channel
              try {
                await client.distube.previous(i.guild.id);
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(
                        `⏮️ **Now playing the previously played track!**`
                      )
                      .setFooter(
                        `💢 Action by: ${member.user.tag}`,
                        member.user.displayAvatarURL({ dynamic: true })
                      ),
                  ],
                }).then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
              } catch {
                return i
                  .reply({
                    content: `${client.allEmojis.x} **There is no other song before the current song.**`,
                    ephemeral: true,
                  })
                  .then((interaction) => {
                    if (
                      newQueue.textChannel.id ===
                      client.settings.get(newQueue.id, `music.channel`)
                    ) {
                      setTimeout(() => {
                        try {
                          i.deleteReply().catch(console.log);
                        } catch (e) {
                          console.log(e);
                        }
                      }, 3000);
                    }
                  });
              }
            }
            if (i.customId == `2`) {
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
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(`⏸ **Paused!**`)
                      .setFooter(
                        `💢 Action by: ${member.user.tag}`,
                        member.user.displayAvatarURL({ dynamic: true })
                      ),
                  ],
                }).then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
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
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(`▶️ **Resumed!**`)
                      .setFooter(
                        `💢 Action by: ${member.user.tag}`,
                        member.user.displayAvatarURL({ dynamic: true })
                      ),
                  ],
                }).then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
              }
            }
            if (i.customId == `3`) {
              //if ther is nothing more to skip then stop music and leave the Channel
              if (newQueue.songs.length == 0) {
                //if its on autoplay mode, then do autoplay before leaving...
                i.reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(ee.color)
                      .setTimestamp()
                      .setTitle(
                        `⏹ **Stopped playing and left the voice channel.**`
                      )
                      .setFooter(
                        `💢 Action by: ${member.user.tag}`,
                        member.user.displayAvatarURL({ dynamic: true })
                      ),
                  ],
                }).then((interaction) => {
                  if (
                    newQueue.textChannel.id ===
                    client.settings.get(newQueue.id, `music.channel`)
                  ) {
                    setTimeout(() => {
                      try {
                        i.deleteReply().catch(console.log);
                      } catch (e) {
                        console.log(e);
                      }
                    }, 3000);
                  }
                });
                clearInterval(songEditInterval);
                //edit the current song message
                await client.distube.stop(i.guild.id);
                return;
              }
              //skip the track
              await client.distube.skip(i.guild.id);
              i.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`⏭ **Skipped to the next song!**`)
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
            }

            if (i.customId === `4`) {
              i.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(
                      `⏹ **Stopped playing and left the voice channel.**`
                    )
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
              clearInterval(songEditInterval);
              //edit the current song message
              await client.distube.stop(i.guild.id);
            }

            if (i.customId === `5`) {
              client.maps.set(
                `beforeshuffle-${newQueue.id}`,
                newQueue.songs.map((track) => track).slice(1)
              );
              //pause the player
              await newQueue.shuffle();
              //Send Success Message
              i.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`🔀 **Shuffled ${newQueue.songs.length} songs!**`)
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
            }

            if (i.customId === `6`) {
              if (newQueue.repeatMode === 2) {
                await newQueue.setRepeatMode(0);
              } else if (newQueue.repeatMode === 0) {
                await newQueue.setRepeatMode(1);
              } else if (newQueue.repeatMode === 1) {
                await newQueue.setRepeatMode(2);
              }
              let mode = newQueue.repeatMode
                ? newQueue.repeatMode == 2
                  ? "Repeat queue"
                  : "Repeat song"
                : "Off";
              i.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(
                      `${
                        mode !== "Off"
                          ? `${client.allEmojis.check_mark} **Repeat mode set to ${mode}!**`
                          : `${client.allEmojis.x} **Disabled repeat mode!**`
                      }`
                    )
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
              var data = receiveQueueData(
                client.distube.getQueue(newQueue.id),
                newQueue.songs[0]
              );
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              });
            }

            if (i.customId === `7`) {
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
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(
                      `⏩ **Skipped forward in the song by \`10 seconds\`!**`
                    )
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
              var data = receiveQueueData(
                client.distube.getQueue(newQueue.id),
                newQueue.songs[0]
              );
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              });
            }

            if (i.customId === `8`) {
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime)
                seektime = 0;
              await newQueue.seek(Number(seektime));
              collector.resetTimer({
                time:
                  (newQueue.songs[0].duration - newQueue.currentTime) * 1000,
              });
              i.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(
                      `⏪ **Went backwards in the song by \`10 seconds\`!**`
                    )
                    .setFooter(
                      `💢 Action by: ${member.user.tag}`,
                      member.user.displayAvatarURL({ dynamic: true })
                    ),
                ],
              }).then((interaction) => {
                if (
                  newQueue.textChannel.id ===
                  client.settings.get(newQueue.id, `music.channel`)
                ) {
                  setTimeout(() => {
                    try {
                      i.deleteReply().catch(console.log);
                    } catch (e) {
                      console.log(e);
                    }
                  }, 3000);
                }
              });
              var data = receiveQueueData(
                client.distube.getQueue(newQueue.id),
                newQueue.songs[0]
              );
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              });
            }
          });
        } catch (error) {
          console.error(error);
        }
      })
      .on(`addSong`, (queue, song) => {
        queue.textChannel
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(ee.color)
                .setThumbnail(
                  `https://img.youtube.com/vi/${song.id}/mqdefault.jpg`
                )
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(
                  `${client.allEmojis.check_mark} **Song added to the Queue!**`
                )
                .setDescription(
                  `👍 Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\``
                )
                .addField(
                  `⌛ **Estimated Time:**`,
                  `\`${queue.songs.length - 1} song${
                    queue.songs.length > 0 ? `s` : ``
                  }\` - \`${(
                    Math.floor(((queue.duration - song.duration) / 60) * 100) /
                    100
                  )
                    .toString()
                    .replace(`.`, `:`)}\``
                )
                .addField(
                  `🌀 **Queue Duration:**`,
                  `\`${queue.formattedDuration}\``
                ),
            ],
          })
          .then((msg) => {
            if (
              queue.textChannel.id ===
              client.settings.get(queue.id, `music.channel`)
            ) {
              setTimeout(() => {
                try {
                  if (!msg.deleted) {
                    msg.delete().catch(() => {});
                  }
                } catch (e) {}
              });
            }
          }, 3000);
      })
      .on(`addList`, (queue, playlist) => {
        queue.textChannel
          .send({
            embeds: [
              new MessageEmbed()
                .setColor(ee.color)
                .setThumbnail(
                  playlist.thumbnail.url
                    ? playlist.thumbnail.url
                    : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`
                )
                .setFooter(
                  `💯` + playlist.user.tag,
                  playlist.user.displayAvatarURL({
                    dynamic: true,
                  })
                )
                .setTitle(
                  `${client.allEmojis.check_mark} **Playlist added to the Queue!**`
                )
                .setDescription(
                  `👍 Playlist: [\`${playlist.name}\`](${
                    playlist.url ? playlist.url : ``
                  })  -  \`${playlist.songs.length} Song${
                    playlist.songs.length > 0 ? `s` : ``
                  }\``
                )
                .addField(
                  `⌛ **Estimated Time:**`,
                  `\`${queue.songs.length - -playlist.songs.length} song${
                    queue.songs.length > 0 ? `s` : ``
                  }\` - \`${(
                    Math.floor(
                      ((queue.duration - playlist.duration) / 60) * 100
                    ) / 100
                  )
                    .toString()
                    .replace(`.`, `:`)}\``
                )
                .addField(
                  `🌀 **Queue Duration:**`,
                  `\`${queue.formattedDuration}\``
                ),
            ],
          })
          .then((msg) => {
            if (
              queue.textChannel.id ===
              client.settings.get(queue.id, `music.channel`)
            ) {
              setTimeout(() => {
                try {
                  if (!msg.deleted) {
                    msg.delete().catch(() => {});
                  }
                } catch (e) {}
              }, 3000);
            }
          });
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchResult`, (message, result) => {
        let i = 0;
        message.channel.send(
          `**Choose an option from below**\n${result
            .map(
              (song) =>
                `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
            )
            .join(`\n`)}\n*Enter anything else or wait 60 seconds to cancel*`
        );
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchCancel`, (message) =>
        message.channel.send(`Searching canceled`).catch((e) => console.log(e))
      )
      .on(`error`, (channel, e) => {
        channel.send(`An error encountered: ${e}`).catch((e) => console.log(e));
        console.error(e);
      })
      .on(`empty`, (queue) =>
        queue.textChannel.send(`Voice channel is empty! Leaving the channel...`)
      )
      .on(`searchNoResult`, (message) =>
        message.channel.send(`No result found!`).catch((e) => console.log(e))
      )
      .on(`finishSong`, (queue, song) => {
        queue.textChannel.messages
          .fetch(PlayerMap.get(`currentmsg`))
          .then((currentSongPlayMsg) => {
            currentSongPlayMsg.delete().catch((e) => {});
          })
          .catch((e) => {});
      })
      .on(`deleteQueue`, (queue) => {
        if (!PlayerMap.has(`deleted-${queue.id}`)) {
          PlayerMap.set(`deleted-${queue.id}`, true);
          if (client.maps.has(`beforeshuffle-${queue.id}`)) {
            client.maps.delete(`beforeshuffle-${newQueue.id}`);
          }
          try {
            //Delete the interval for the check relevant messages system so
            clearInterval(
              playerintervals.get(`checkrelevantinterval-${queue.id}`)
            );
            playerintervals.delete(`checkrelevantinterval-${queue.id}`);
            // Delete the Interval for the autoresume saver
            clearInterval(
              playerintervals.get(`autoresumeinterval-${queue.id}`)
            );
            if (client.autoresume.has(queue.id))
              client.autoresume.delete(queue.id); //Delete the db if it's still in there
            playerintervals.delete(`autoresumeinterval-${queue.id}`);
            // Delete the interval for the Music Edit Embeds System
          } catch (e) {
            console.log(e);
          }
          queue.textChannel
            .send({
              embeds: [
                new MessageEmbed()
                  .setColor(ee.color)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`⛔️ QUEUE HAS BEEN DELETED!`)
                  .setDescription(
                    `This might have happened because the voice channel was empty, the bot was kicked from the voice channel, it was stopped by someone, or the queue ended.`
                  )
                  .setTimestamp(),
              ],
            })
            .then((msg) => {
              if (
                queue.textChannel.id ===
                client.settings.get(queue.id, `music.channel`)
              ) {
                setTimeout(() => {
                  try {
                    if (!msg.deleted) {
                      msg.delete().catch(() => {});
                    }
                  } catch (e) {}
                });
              }
            }, 3000);
        }
      })
      .on(`initQueue`, (queue) => {
        try {
          if (PlayerMap.has(`deleted-${queue.id}`)) {
            PlayerMap.delete(`deleted-${queue.id}`);
          }
          let data = client.settings.get(queue.id);
          queue.autoplay = Boolean(data.defaultautoplay);
          queue.volume = Number(data.defaultvolume);
          queue.setFilter(data.defaultfilters);

          /**
           * Check-Relevant-Messages inside of the Music System Request Channel
           */
          var checkrelevantinterval = setInterval(async () => {
            if (
              client.settings.get(queue.id, `music.channel`) &&
              client.settings.get(queue.id, `music.channel`).length > 5
            ) {
              console.log(
                `Music System - Relevant Checker`.brightCyan +
                  ` - Checkingfor unrelevant Messages`
              );
              let messageId = client.settings.get(queue.id, `music.message`);
              //try to get the guild
              let guild = client.guilds.cache.get(queue.id);
              if (!guild)
                return console.log(
                  `Music System - Relevant Checker`.brightCyan +
                    ` - Guild not found!`
                );
              //try to get the channel
              let channel = guild.channels.cache.get(
                client.settings.get(queue.id, `music.channel`)
              );
              if (!channel)
                channel =
                  (await guild.channels
                    .fetch(client.settings.get(queue.id, `music.channel`))
                    .catch(() => {})) || false;
              if (!channel)
                return console.log(
                  `Music System - Relevant Checker`.brightCyan +
                    ` - Channel not found!`
                );
              if (
                !channel
                  .permissionsFor(channel.guild.me)
                  .has(Permissions.FLAGS.MANAGE_MESSAGES)
              )
                return console.log(
                  `Music System - Relevant Checker`.brightCyan +
                    ` - Missing Permissions`
                );
              //try to get the channel
              let messages = await channel.messages.fetch();
              if (messages.filter((m) => m.id != messageId).size > 0) {
                channel
                  .bulkDelete(messages.filter((m) => m.id != messageId))
                  .catch(() => {})
                  .then((messages) =>
                    console.log(
                      `Music System - Relevant Checker`.brightCyan +
                        ` - Bulk deleted ${messages.size} messages`
                    )
                  );
              } else {
                console.log(
                  `Music System - Relevant Checker`.brightCyan +
                    ` - No Relevant Messages`
                );
              }
            }
          }, settings["music-system-relevant-checker-delay"] || 60000);
          playerintervals.set(
            `checkrelevantinterval-${queue.id}`,
            checkrelevantinterval
          );

          /**
           * AUTO-RESUME-DATABASING
           */
          var autoresumeinterval = setInterval(async () => {
            var newQueue = client.distube.getQueue(queue.id);
            if (
              newQueue &&
              newQueue.id &&
              client.settings.get(newQueue.id, `autoresume`)
            ) {
              const makeTrackData = (track) => {
                return {
                  memberId: track.member.id,
                  source: track.source,
                  duration: track.duration,
                  formattedDuration: track.formattedDuration,
                  id: track.id,
                  isLive: track.isLive,
                  name: track.name,
                  thumbnail: track.thumbnail,
                  type: "video",
                  uploader: track.uploader,
                  url: track.url,
                  views: track.views,
                };
              };
              client.autoresume.ensure(newQueue.id, {
                guild: newQueue.id,
                voiceChannel: newQueue.voiceChannel
                  ? newQueue.voiceChannel.id
                  : null,
                textChannel: newQueue.textChannel
                  ? newQueue.textChannel.id
                  : null,
                songs:
                  newQueue.songs && newQueue.songs.length > 0
                    ? [...newQueue.songs].map((track) => makeTrackData(track))
                    : null,
                volume: newQueue.volume,
                repeatMode: newQueue.repeatMode,
                playing: newQueue.playing,
                currentTime: newQueue.currentTime,
                filters: [...newQueue.filters].filter(Boolean),
                autoplay: newQueue.autoplay,
              });
              let data = client.autoresume.get(newQueue.id);
              if (data.guild != newQueue.id)
                client.autoresume.set(newQueue.id, newQueue.id, `guild`);
              if (
                data.voiceChannel != newQueue.voiceChannel
                  ? newQueue.voiceChannel.id
                  : null
              )
                client.autoresume.set(
                  newQueue.id,
                  newQueue.voiceChannel ? newQueue.voiceChannel.id : null,
                  `voiceChannel`
                );
              if (
                data.textChannel != newQueue.textChannel
                  ? newQueue.textChannel.id
                  : null
              )
                client.autoresume.set(
                  newQueue.id,
                  newQueue.textChannel ? newQueue.textChannel.id : null,
                  `textChannel`
                );

              if (data.volume != newQueue.volume)
                client.autoresume.set(newQueue.id, newQueue.volume, `volume`);
              if (data.repeatMode != newQueue.repeatMode)
                client.autoresume.set(
                  newQueue.id,
                  newQueue.repeatMode,
                  `repeatMode`
                );
              if (data.playing != newQueue.playing)
                client.autoresume.set(newQueue.id, newQueue.playing, `playing`);
              if (data.currentTime != newQueue.currentTime)
                client.autoresume.set(
                  newQueue.id,
                  newQueue.currentTime,
                  `currentTime`
                );
              if (
                !arraysEqual(
                  [...data.filters].filter(Boolean),
                  [...newQueue.filters].filter(Boolean)
                )
              )
                client.autoresume.set(
                  newQueue.id,
                  [...newQueue.filters].filter(Boolean),
                  `filters`
                );
              if (data.autoplay != newQueue.autoplay)
                client.autoresume.set(
                  newQueue.id,
                  newQueue.autoplay,
                  `autoplay`
                );
              if (
                newQueue.songs &&
                !arraysEqual(data.songs, [...newQueue.songs])
              )
                client.autoresume.set(
                  newQueue.id,
                  [...newQueue.songs].map((track) => makeTrackData(track)),
                  `songs`
                );

              function arraysEqual(a, b) {
                if (a === b) return true;
                if (a == null || b == null) return false;
                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                  if (a[i] !== b[i]) return false;
                }
                return true;
              }
            }
          }, settings["auto-resume-save-cooldown"] || 5000);
          playerintervals.set(
            `autoresumeinterval-${queue.id}`,
            autoresumeinterval
          );
        } catch (error) {
          console.error(error);
        }
      });
  } catch (e) {
    console.log(String(e.stack).bgRed);
  }
  //for normal tracks
  function receiveQueueData(newQueue, newTrack) {
    if (!newQueue)
      return new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setTitle(`NO SONG FOUND?!?!`);
    var djs = client.settings.get(newQueue.id, `djroles`);
    if (!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map((r) => `<@&${r}>`);
    if (djs.length == 0) djs = `\`not setup\``;
    else djs.slice(0, 15).join(`, `);
    if (!newTrack)
      return new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setTitle(`NO SONG FOUND?!?!`);
    var embed = new MessageEmbed()
      .setColor(ee.color)
      .setDescription(
        `[See the queue on the **DASHBOARD**!](${
          require(`../dashboard/settings.json`).website.domain
        }/queue/${newQueue.id})`
      )
      .addField(`💡 Requested by:`, `>>> ${newTrack.user}`, true)
      .addField(`🔊 Volume:`, `>>> \`${newQueue.volume}%\``, true)
      .addField(
        `🌀 Queue:`,
        `>>> \`${newQueue.songs.length} song${
          newQueue.songs.length > 1 ? "s" : ""
        }\`\n\`${newQueue.formattedDuration}\``,
        true
      )
      .addField(
        `♾ Loop:`,
        `>>> ${
          newQueue.repeatMode
            ? newQueue.repeatMode === 2
              ? `${client.allEmojis.check_mark}\` Queue\``
              : `${client.allEmojis.check_mark} \` Song\``
            : `${client.allEmojis.x}`
        }`,
        true
      )
      .addField(
        `❔ Filter${newQueue.filters.length > 0 ? `s` : ``}:`,
        `>>> ${
          newQueue.filters && newQueue.filters.length > 0
            ? `${newQueue.filters.map((f) => `\`${f}\``).join(`, `)}`
            : `${client.allEmojis.x}`
        }`,
        newQueue.filters.length > 4 ? false : true
      )
      .addField(
        `🎧 DJ roles${
          client.settings.get(newQueue.id, `djroles`).length > 1 ? `s` : ``
        }:`,
        `>>> ${djs}`,
        newQueue.filters.length > 4 ? false : true
      )
      .addField(
        `⏱ Duration:`,
        `\`${newQueue.formattedCurrentTime}\` ${createBar(
          newQueue.songs[0].duration,
          newQueue.currentTime,
          13
        )} \`${newQueue.songs[0].formattedDuration}\``
      )
      .setAuthor(
        `${newTrack.name}`,
        `https://images-ext-1.discordapp.net/external/DkPCBVBHBDJC8xHHCF2G7-rJXnTwj_qs78udThL8Cy0/%3Fv%3D1/https/cdn.discordapp.com/emojis/859459305152708630.gif`,
        newTrack.url
      )
      .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setFooter(ee.footertext, ee.footericon);
    let previous = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("1")
      .setEmoji(`⏮️`)
      .setLabel(`Previous`);
    let pause = new MessageButton()
      .setStyle("SUCCESS")
      .setCustomId("2")
      .setEmoji(`⏸️`)
      .setLabel(`Pause`);
    let next = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("3")
      .setEmoji("⏭️")
      .setLabel(`Next`);
    let stop = new MessageButton()
      .setStyle("DANGER")
      .setCustomId("4")
      .setEmoji("⏹️")
      .setLabel(`Stop`);
    let shuffle = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("5")
      .setEmoji("🔀")
      .setLabel(`Shuffle`);
    if (!newQueue.playing) {
      pause = pause.setStyle("SECONDARY").setEmoji("▶️").setLabel(`Resume`);
    }
    let loop = new MessageButton()
      .setStyle("SECONDARY")
      .setCustomId("6")
      .setEmoji(`🔁`)
      .setLabel(`Loop`);
    let forward = new MessageButton()
      .setStyle("PRIMARY")
      .setCustomId("7")
      .setEmoji("⏩")
      .setLabel(`+10 Seconds`);
    let rewind = new MessageButton()
      .setStyle("PRIMARY")
      .setCustomId("8")
      .setEmoji("⏪")
      .setLabel(`-10 Seconds`);
    if (newQueue.repeatMode === 0) {
      loop = loop.setStyle("SECONDARY");
    }
    if (newQueue.repeatMode === 1) {
      loop = loop.setStyle("SUCCESS").setEmoji("🔂");
    }
    if (newQueue.repeatMode === 2) {
      loop = loop.setStyle("SUCCESS");
    }
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
    const row2 = new MessageActionRow().addComponents([loop, forward, rewind]);
    return {
      embeds: [embed],
      components: [row, row2],
    };
  }
};
function escapeRegex(str) {
  try {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch {
    return str;
  }
}
