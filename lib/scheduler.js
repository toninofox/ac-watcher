const log = require('debug')('scheduler');
const moment = require('moment');
const Agenda = require('agenda');
const Discord = require('discord.js');

const reminderJobName = "scheduler";
const dateFormatString = "dddd, MMMM Do, YYYY [at] hh:mm:ss A"

const {MONGO_HOST} = process.env
const agenda = new Agenda({db: {address: MONGO_HOST,  collection: 'scheduler',processEvery: '180 seconds'}},);


(async function() { 
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

    this.getAgenda = function() {
        return agenda
    }

    this.setCustomReminder = async function (channelId, name, {date,every}) {

        log("setting reminder ",name, date)
        try {
            const job = await agenda.schedule(date, reminderJobName, { channelId, reminder: name });
            if(every){
                job.repeatEvery(every.replace("every","").trim(),{
                    skipImmediate: true
                })
                await job.save()
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
    this.listReminders = async function (channelId) {
    const jobs = await agenda.jobs({ name: reminderJobName, 'data.channelId': channelId, nextRunAt: { $ne: null } })

         if (jobs.length === 0) {

                return;
            }
            else {
                jobs.sort(function (a, b) {
                    return a.attrs.nextRunAt - b.attrs.nextRunAt;
                });
                return jobs.map(job=> {
                        
                    let nextRunAt = moment(job.attrs.nextRunAt).format(dateFormatString);
                    let reminder = job.attrs.data.reminder;
                    return {nextRunAt,reminder,repeatInterval:job.attrs.repeatInterval}
                })

            }

    }

    this.deleteReminder = async function (channelId, name) {

        log("delete reminder ",name)
        try {
            
            const jobs = await agenda.jobs({ name: reminderJobName,'data.channelId': channelId, 'data.reminder': name, nextRunAt: { $ne: null } })
            if (jobs.length === 0) {
                await msg.delete({ timeout: 10000 })
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
            return {nextRunAt, reminder, repeatInterval:job.attrs.repeatInterval}
        }
    }

     /**
     * Use this function to send a reminder to a user
     *
     * @param userId the id of the user to send a reminder to
     * @param {String} message the reminder message to send to a user
     */
    const sendReminder = async function (data) {
        if(!data){
            return
        }
       log("Sending ",data.reminder)
        const channel = await bot.channels.fetch(data.channelId);
        const embeddedmessage = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(data.reminder)
                .setDescription('@everyone '+data.reminder+' is about to start!')
                .setThumbnail('https://64.media.tumblr.com/8dc2e74dd66a62681b9923b276b1b235/tumblr_pez1neQ60o1wpyxh6o3_540.gif')
                .setTimestamp()
        await channel.send(embeddedmessage);

        log("reminder sent to channel " + data.chanelId);
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
