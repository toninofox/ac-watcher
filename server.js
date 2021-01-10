require('dotenv').config();
const express = require('express');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
const ACReminder = require('./lib/acReminder');
const Scheduler = require('./lib/scheduler');
const Agendash = require('agendash2');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Ok');
});



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

Object.keys(botCommands).map(key => {
  if(botCommands[key].list){
    botCommands[key].list.forEach(el => {
      console.log("Setting",el.name)
        bot.commands.set(el.name, el);
    });
  } else {
    bot.commands.set(botCommands[key].name, botCommands[key]);
  }
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);
const acReminder = new ACReminder(bot)
const scheduler = new Scheduler(bot)
app.use('/dash', Agendash(scheduler.getAgenda()));

bot.on('ready', () => { 
  console.info(`Logged in as ${bot.user.tag}!`);
  bot.user.setPresence({
    status: 'online',
    activity: {
        name: 'watchMyAnal.help',
        type: 'LISTENING'
    }
  })
  bot.user.setUsername('Watch My Anal')
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();
  console.info(`Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args,{scheduler,acReminder});
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
