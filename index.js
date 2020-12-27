require('dotenv').config();
const {isArray} = require('lodash')
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
  if(botCommands[key].list){
    botCommands[key].list.forEach(el => {
        bot.commands.set(el.name, el);
    });
  } else {
    bot.commands.set(botCommands[key].name, botCommands[key]);
  }
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on('ready', () => { 
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();
  console.info(`Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args,bot);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
