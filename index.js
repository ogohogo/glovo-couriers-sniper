const config = require("./config")
const fs = require("fs");

const refreshToken = require("./controllers/refreshToken");
const getCalendarData = require("./controllers/getCalendarData");

const bookSlot = require("./controllers/bookSlot");
const sendWebhook = require("./controllers/sendWebhook");

const db = require("./controllers/db/models");

var slots = [];
var postedSlots = [];

function bookSlots() {
    slots.forEach((slot, i) => {
        setTimeout(async () => {
            const data = await bookSlot(slot.id);

            if (!data.success) return slots.splice(i, 1);
    
            await sendWebhook(`@everyone Booked a slot at ${new Date(slot.startTime).toLocaleString()}`);
            return console.log(`Booked slot ${slot.id} at ${new Date().toLocaleString()}`);
        }, i * 1300)
    })
}

setInterval(async () => {

    const accessTokens = await db.accessToken.findOne({
        where: {
            id: 1
        }
    })


    let time = parseInt((Date.now() / 1000).toFixed());
    if (time - accessTokens.refreshedAt >= config.refreshTokenTime) return await refreshToken();

    if (slots.length > 0) return bookSlots();

    const data = await getCalendarData();

    if (!data.success) return;

    data.days.forEach(day => {

        if (day.zonesSchedule.length == 0) return;

        day.zonesSchedule[0].slots.forEach(async slot => {
            if (slot.status == 'UNAVAILABLE' || slot.status == 'BOOKED') return;
            if (Date.now() > slot.startTime) return;
    
            let actualStartTime = slot.startTime
            let minStartTime = (Date.now() + (config.minStartTime * 60 * 60 * 1000))

            if (actualStartTime < minStartTime) {
                if (postedSlots.includes(slot.id)) return;
            
                postedSlots.push(slot.id)
                fs.writeFileSync("./bookedSlots.json", JSON.stringify(postedSlots, null, 2))

                await sendWebhook(`A slot is available for ${new Date(slot.startTime).toLocaleString()}`) 
            }

            let hour = new Date(actualStartTime).getHours();
            let day = new Date(actualStartTime).getDay();

            if (!config.acceptedHours[day].includes(hour)) return;

            slots.push(slot);
            return bookSlots();
        })
    })

    
}, config.refreshSlotsTime * 1000);
