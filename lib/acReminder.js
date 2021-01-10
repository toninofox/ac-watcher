const log = require('debug')('scheduler');
const moment = require('moment');
const Agenda = require('agenda');
const Discord = require('discord.js');

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

    this.setCustomReminder = async function (channel, name, {date,coordinates, description}) {

        log("setting reminder ",name, date)
        try {
            
            await agenda.schedule(date, reminderJobName, { channelId: channel, reminder: name , description, coordinates});
            
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
                jobs.sort(function (a, b) {
                    return a.attrs.nextRunAt - b.attrs.nextRunAt;
                });
                for (let i = 0; i < jobs.length; i++) {
                    const job = jobs[i];
                        
                    let nextRunAt = moment(job.attrs.nextRunAt).format(dateFormatString);
                    let reminder = job.attrs.data.reminder;
                    const msg = await channel.send(`[${reminder}] on ${nextRunAt}`)
                }

            }

    }

    this.deleteReminder = async function (channelId, args) {

        log("delete reminder ",args)
        const analName = args[0]
        try {
            
            const jobs = await agenda.jobs({ name: reminderJobName,'data.channelId': channelId, 'data.reminder': analName, nextRunAt: { $ne: null } })
            if (jobs.length === 0) {
            }
            else {
                await Promise.all(jobs.map(j=> j.remove()))
            }
        } catch (error) {
            log(error)
        }
    }

    this.getReminder = async function (channel, remindername) {
    const jobs = await agenda.jobs({ name: reminderJobName, 'data.channelId': channel.id, 'data.reminder' : remindername, nextRunAt: { $ne: null } })
         if (jobs.length === 0) {
                return {};
        }else {
            const job = jobs[0];
            let nextRunAt = moment(job.attrs.nextRunAt).format(dateFormatString);
            let reminder = job.attrs.data.reminder;
            return {nextRunAt, reminder}
        }
    }

     /**
     * Use this function to send a reminder to a user
     *
     * @param {String} message the reminder message to send to a user
     */
    const sendReminder = async function (data) {
        if(!data){
            return
        }
       log("Sending ",data.message)
        const channel = await bot.channels.fetch(data.channelId);
        const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(data.message)
                .setURL('https://discord.js.org/')
                .setDescription('@everyone The Anal '+data.message+' is about to open!')
                .addField("Description", data.description || "-")
                .addField("Coordinates", data.coordinates || "-")
                .setThumbnail('https://cdn.discordapp.com/avatars/790158565784027146/5a04be881fe32b37a198d225273d7d52.png')
                .setTimestamp()
        await channel.send(embeddedmessage);

        log("reminder sent to channel " + channelId);
    }

     agenda.define(reminderJobName,function (job) {
        log("Sending Reminder",job)
        const data = job.attrs.data;
        sendReminder(data);
    });

    agenda.on('ready', async function () {
        console.log("Ready")
        agenda.now(reminderJobName)
    });
    
}

module.exports = Scheduler;
