const log = require('debug')('scheduler');
const moment = require('moment');
const Agenda = require('agenda');
const Discord = require('discord.js');

const StringBuilder = require('string-builder');

const reminderJobName = "acJob";
const dateFormatString = "dddd, MMMM Do, YYYY [at] hh:mm:ss A"

const {MONGO_HOST} = process.env
const agenda = new Agenda({db: {address: MONGO_HOST,  collection: 'scheduler',processEvery: '180 seconds'}},);


(async function() { // IIFE to give access to async/await
  await agenda.start();
})();

agenda.on('error', async function (error) {
    log(error)
});
    

/**
 * Creates a scheduler
 * @param {Object} bot the discord.js bot instance we are using to communicate with discord
 */
function Scheduler(bot) {


    /**
    * Use this function to set a reminder for a user
    *
    * @param channel the discord channel this request is coming from
    * @param {String} message the message from the user containing the reminder text and time
    */
    this.setReminder = async function (channel, args) {

        log("setting reminder ",args)
        const message = args[0]
        const date = `${args[1]} ${args[2]} ${args[3]}`
        try {
            
            await agenda.schedule(date, reminderJobName, { channelId: channel.id, reminder: message });
            
        } catch (error) {
            log(error)
        }
        
    }

    this.deleteReminder = async function (channel, args) {

        log("delete reminder ",args)
        const analName = args[0]
        try {
            
            const jobs = await agenda.jobs({ name: reminderJobName, 'data.reminder': analName, nextRunAt: { $ne: null } })
            if (jobs.length === 0) {
                const msg = await channel.send(`You have no anal reminder set with this name`)
                await msg.delete({ timeout: 10000 })
            }
            else {
                await Promise.all(jobs.map(j=> j.remove()))
            }
        } catch (error) {
            log(error)
        }
    }



    /**
    * Use this function to list all upcoming reminders for a user
    *
    * @param channel the discord channelId this request is coming from
    */
    this.listReminders = async function (channel) {
    const jobs = await agenda.jobs({ name: reminderJobName, 'data.channelId': channel.id, nextRunAt: { $ne: null } })

         if (jobs.length === 0) {

                await channel.send(`There is no anal reminder pending`);
                return;
            }
            else {

                var sb = new StringBuilder();
                sb.appendLine(`I have found the following upcoming anals for you:`)

                //sort upcoming jobs so the soonest to run is first, latest to run is last.
                jobs.sort(function (a, b) {
                    return a.attrs.nextRunAt - b.attrs.nextRunAt;
                });

                for (let job of jobs) {

                    let nextRunAt = moment(job.attrs.nextRunAt);
                    let reminder = job.attrs.data.reminder;

                    sb.appendLine();
                    sb.appendLine(`\tAnal: **${reminder}**`);
                    sb.appendLine(`\tWhen: **${nextRunAt.format(dateFormatString)}**`);
                }

                await channel.send(sb.toString());
            }

    }

     /**
     * Use this function to send a reminder to a user
     *
     * @param userId the id of the user to send a reminder to
     * @param {String} message the reminder message to send to a user
     */
    const sendReminder = async function (channelId, message) {
       log("Sending ",message)
        const channel = await bot.channels.fetch(channelId);
        const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(message)
                .setURL('https://discord.js.org/')
                .setDescription('@everyone The Anal '+message+'  is about to open!')
                .setThumbnail('https://cdn.discordapp.com/avatars/790158565784027146/5a04be881fe32b37a198d225273d7d52.png')
                .setTimestamp()
        await channel.send(embeddedmessage);

        log("reminder sent to channel " + channelId);
    }

     agenda.define(reminderJobName,function (job) {
        log("Sending Reminder",job)
        const data = job.attrs.data;
        sendReminder(data.channelId, data.reminder);
    });

    agenda.on('ready', async function () {
        console.log("Ready")
        agenda.now(reminderJobName)
    });
    
}

module.exports = Scheduler;
