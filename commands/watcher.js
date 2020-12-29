const Discord = require('discord.js');

const help = async channel => {
   const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Helper")
                .setDescription('List of functions')
                .addField("set <what> <when>","Add a new anal reminder. The name should be a single word and the time is a human interval expession https://github.com/agenda/human-interval. Ex: watchMyAnal.set AC_LV4_WEAPON in 1 day and 3 hours")
                .addField("channel <channelMention> <what> <when>","Set an anal reminder for that particular channel")                
                .addField("list","List all pending reminders")
                .addField("remove <what>","remove the anal scheduled with that name")
                .setThumbnail('https://cdn.discordapp.com/avatars/790158565784027146/5a04be881fe32b37a198d225273d7d52.png')
        await channel.send(embeddedmessage);
}
module.exports = {
  list:[
    {
      name: 'watchmyanal.set',
      description: 'set a reminder',
      async execute(msg, args,scheduler) {
        const channel = msg.channel
        await scheduler.setReminder(channel,args)
        msg.react('🆗');
      }
    },
    {
      name: 'watchmyanal.list',
      description: 'list reminders',
      async execute(msg, args,scheduler) {
        const channel = msg.channel
        await scheduler.listReminders(channel)
      }
    },
    {
      name: 'watchmyanal.remove',
      description: 'remove reminders',
      async execute(msg, args,scheduler) {
        const channel = msg.channel
        await scheduler.deleteReminder(channel,args)
        msg.react('🆗');
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
      description: 'lazy helper',
      async execute(msg, args,scheduler) {
        const channel = msg.channel
        if(args && args.length){
          await scheduler.setReminder(channel,args)
          msg.react('🆗');
        } else {
          await help(channel)
        }
      }
    },
    {
      name: '!wma',
      description: 'lazy helper',
      async execute(msg, args,scheduler) {
        const channel = msg.channel
        if(args && args.length){
          await scheduler.setReminder(channel,args)
          msg.react('🆗');
        } else {
          await help(channel)
        }
      }
    },
    {
      name: 'wma.channel',
      description: 'mention another channel to send notification to',
      async execute(msg, args,scheduler) {
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msg.channel
        if(args && args.length){
          await scheduler.setReminder(channel,args.slice(1))
          msg.react('🆗');
        }
      }
    },
    {
      name: 'watchmyanal.channel',
      description: 'mention another channel to send notification to',
      async execute(msg, args,scheduler) {
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msg.channel
        if(args && args.length){
          await scheduler.setReminder(channel,args.slice(1))
          msg.react('🆗');
        }
      }
    },
    {
      name: 'watchmyanal.robmod',
      description: 'rob MOD',
      async execute(msg, args,scheduler) {
        const channel = msg.mentions.channels.size ? msg.mentions.channels.entries().next().value[1] : msg.channel
        await channel.send("m.rob <@723520852867416208>")
      }
    }
  ]
    
};
