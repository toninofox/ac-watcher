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
        await scheduler.help(channel)
      }
    }
  ]
    
};
