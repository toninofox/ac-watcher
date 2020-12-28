const Scheduler = require("../lib/scheduler");

module.exports = {
  list:[
    {
      name: 'watchmyanal.set',
      description: 'set a reminder',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        await scheduler.setReminder(channel,args)
        msg.react('🆗');
      }
    },
    {
      name: 'watchmyanal.list',
      description: 'list reminders',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        await scheduler.listReminders(channel)
      }
    },
    {
      name: 'watchmyanal.remove',
      description: 'remove reminders',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        await scheduler.deleteReminder(channel,args)
        msg.react('🆗');
      }
    },
    {
      name: 'watchmyanal.help',
      description: 'helper',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        await scheduler.help(channel)
      }
    },
    {
      name: 'watchmyanal',
      description: 'lazy helper',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        if(args && args.length){
          await scheduler.setReminder(channel,args)
          msg.react('🆗');
        } else {
          await scheduler.help(channel)
        }
      }
    },
    {
      name: '!wma',
      description: 'lazy helper',
      async execute(msg, args,bot) {
        const channel = msg.channel
        const scheduler = new Scheduler(bot)
        if(args && args.length){
          await scheduler.setReminder(channel,args)
          msg.react('🆗');
        } else {
          await scheduler.help(channel)
        }
      }
    }
  ]
    
};
