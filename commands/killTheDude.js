const Discord = require('discord.js');
const repository = require('../lib/repository')

const helpDude = async channel => {
   const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Helper")
                .setDescription('List of functions')
                .addField("killthedude.horde <channel?> <when> <every>", "Create a Horde reminder. Example in current channel: killthedude in 2 days every week. Example in another channel:killthedude #channel123 in 2 days every week")
                .addField("killthedude.trap <channel?> <when> <every>", "Create a Trap reminder. Example in current channel: killthedude in 2 days every week. Example in another channel:killthedude #channel123 in 2 days every week")
                .addField("killthedude.list","List all existing reminders for the mentioned channel (or current one). From here it is possible to delete all of them and recreate")
        await channel.send(embeddedmessage);
}
const parseReminder = args => {
  if(args && args.length){
    let re = /(?<date>.*)(?<every>every .*)/i;

          const result  = args.join(" ").match(re);
            return  result ? result.groups : {}
  } else {
    return {}
  }
}


const reminderToMessage = async (reminder,msgChannel,channel, scheduler) => {
  const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(reminder.reminder)
                .setURL('https://discord.js.org/')
                .addField("Next Execution", reminder.nextRunAt || "-")
                .addField("Repeat Every", reminder.repeatInterval || "-")
  const m = await msgChannel.send(embeddedmessage);
  await Promise.all([m.react('🗑️')])
  try {
    const collected = await m.awaitReactions((reaction, user) => user.id !== m.author.id && (reaction.emoji.name == '🗑️'),{ max: 1, time: 30000 ,errors: ['time']})
    if(
      collected.first().emoji.name == '🗑️'
    ) {
      await scheduler.deleteReminder(channel.id, reminder.reminder)
      m.delete()
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
      name: 'killthedude.trap',
      description: 'create a reminder in a channel (optional)',
      async execute(msg, args, {scheduler}) {
        let obj, channel
        if(msg.mentions.channels.size){
          channel = msg.mentions.channels.entries().next().value[1]
          obj = parseReminder(args.slice(1))
        }else {
          channel = msg.channel
          obj = parseReminder(args)
        }
        await scheduler.setCustomReminder(channel.id,"Trap",obj)
        msg.react('🆗');
      }
    },    
     {
      name: 'killthedude.horde',
      description: 'create a reminder in a channel (optional)',
      async execute(msg, args, {scheduler}) {
        let obj, channel
        if(msg.mentions.channels.size){
          channel = msg.mentions.channels.entries().next().value[1]
          obj = parseReminder(args.slice(1))
        }else {
          channel = msg.channel
          obj = parseReminder(args)
        }
        await scheduler.setCustomReminder(channel.id,"Horde",obj)
        msg.react('🆗');
      }
    },    
    {
      name: 'killthedude.help',
      description: 'list commands',
      async execute(msg) {
       await helpDude(msg.channel)
      }
    },{
      name: 'killthedude.list',
      description: 'list all reminders',
      async execute(msg, args,{scheduler}) {
        const msgChannel = msg.channel
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msgChannel
        const reminders = await scheduler.listReminders(channel.id)
        if(reminders){
          reminders.forEach(ac=> reminderToMessage(ac,msgChannel,channel, scheduler))
        } else {
          msg.react('🚫');
        }
      }
    },
  ],
    
};
