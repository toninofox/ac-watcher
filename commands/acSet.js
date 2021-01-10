const Discord = require('discord.js');
const repository = require('../lib/repository')


const help = async channel => {
   const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Helper")
                .setDescription('List of functions')
                .addField("watchmyanal.create [Name] [coordinates] [description]", "create a new AC in the defined channel (optional) or in the current one if not defined. Example: watchmyanal.create [AC LV4 Weapon] [120x 451y] [Usually battled with XXX]")
                .addField("watchmyanal.list","List all existing anals for the mentioned channel (or current one). From here it is possible to schedule them or delete")
                .setThumbnail('https://cdn.discordapp.com/avatars/790158565784027146/5a04be881fe32b37a198d225273d7d52.png')
        await channel.send(embeddedmessage);
}
const parse = args => {
  const matches = args.join(" ").match(/\[(.*?)\]/g);
  if (matches) {
      return { 
        name: clean(matches[0]),
        coordinates: clean(matches[1]),
        description: clean(matches[2])
      }
  } else {
    return {}
  }
}


const clean = value => value ? value.replace("[","").replace("]","") : ""

const acToMessage = async (ac,msgChannel,channel, scheduler) => {
  const reminder = await scheduler.getReminder(channel, ac.name)
  const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(ac.name)
                .setURL('https://discord.js.org/')
                .addField("Next Execution", reminder.nextRunAt || "-")
                .setThumbnail('https://cdn.discordapp.com/avatars/790158565784027146/5a04be881fe32b37a198d225273d7d52.png')
  if(ac.coordinates){
    embeddedmessage.addField("Coordinates", ac.coordinates || "-")
  }
  if(ac.description){
    embeddedmessage.addField("Coordinates", ac.description || "-")
  }
  const m = await msgChannel.send(embeddedmessage);
  await Promise.all([m.react('🗑️')
  , m.react('⏰')])
  try {
    const collected = await m.awaitReactions((reaction, user) => user.id !== m.author.id && (reaction.emoji.name == '🗑️' || reaction.emoji.name == '⏰'),{ max: 1, time: 30000 ,errors: ['time']})
    if(
      collected.first().emoji.name == '🗑️'
    ) {
      await repository.delete(channel.id, ac.name)
      await scheduler.deleteReminder(channel.id, [ac.name])
      m.delete()
    }
    if(
      collected.first().emoji.name == '⏰'
    ) {
      const user = Array.from(collected.first().users.cache.values())[1]
      const reminderAuthor = user.id
      try {
        await msgChannel.send(`<@${reminderAuthor}> Set the time for ${ac.name} (examples: in 2 days and 12 hours --- in 10 hours --- in 10 minutes)`);
        const collectedMsg = await msgChannel.awaitMessages(m3 => reminderAuthor === m3.author.id ,{ max: 1, time: 30000 ,errors: ['time']})
        const messageCollected = collectedMsg.first()
        await scheduler.setCustomReminder(channel.id, ac.name, {date: parser ? parser(messageCollected.content) : messageCollected.content, ...ac})
        messageCollected.react('🆗')
      } catch (error) {
        console.log(error)
      }

    }
  } catch (error) {
    console.log(error)
    m.reactions.removeAll()
  } finally {
    return
  }
}



module.exports = {
  list:[    
    {
      name: 'watchmyanal.create',
      description: 'create a anal in a channel (optional)',
      async execute(msg, args) {
        let obj, channel
        if(msg.mentions.channels.size){
          channel = msg.mentions.channels.entries().next().value[1]
          obj = parse(args.slice(1))
        }else {
          channel = msg.channel
          obj = parse(args)
        }
        await repository.create(channel.id,obj)
        msg.react('🆗');
      }
    },{
      name: 'watchmyanal.list',
      description: 'list all acs',
      async execute(msg, args,{acReminder}) {
        const msgChannel = msg.channel
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msgChannel
        const acs = await repository.getAll(channel.id)
        acs.forEach(ac=> acToMessage(ac,msgChannel,channel, acReminder))
      }
    },{
      name: 'wma.list',
      description: 'list all acs',
      async execute(msg, args,{acReminder}) {
        const msgChannel = msg.channel
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msgChannel
        const acs = await repository.getAll(channel.id)
        if(acs && acs.length){
           acs.forEach(ac=> acToMessage(ac,msgChannel,channel, acReminder))
        } else {
          msg.react('🚫');
        }
      }
    },
    {
      name: 'watchmyanal.help',
      description: 'helper',
      async execute(msg, args) {
        await help(msg.channel)
      }
    },
    {
      name: 'watchmyanal',
      description: 'helper',
      async execute(msg, args) {
        await help(msg.channel)
      }
    },
     ],
    
};
