const login = require("./modules/glovo/login");

const getShifts = require("./modules/glovo/calendar/shifts");
const getSwaps = require("./modules/glovo/calendar/swaps");

const assignShift = require("./modules/glovo/assign/shift");
const assignSwap = require("./modules/glovo/assign/swap");

const webhook = require("./modules/discord/webhook");

const fs = require("fs").promises;

const { GLOVO, DISCORD, DEBUG } = require("./config");

async function initLogin() {
    const data = await login();

    if (!data.success && DEBUG) return console.log(`Failed to login! - ${data.message}`);

    let updatedJSON = {
        "EMPLOYEE_ID": data.user_id,
        "CITY_ID": data.city_id,
        "ACCESS_TOKEN": data.access_token,
        "TOKEN_EXPIRES_AT": data.expires_in,
    }

    await fs.writeFile("./src/cookies.json", JSON.stringify(updatedJSON, null, 2));

    return console.log(`Successfully logged in as ${data.name}!`);
}

async function refreshSwaps() {
    GLOVO.DATES.forEach(async (date, i) => {

        setTimeout(async () => {
            const swaps = await getSwaps(date);
            if (!swaps.success && DEBUG) return console.log(`Failed to fetch swaps! - ${swaps.error} - ${date}`);

            for (const swap of swaps.swaps) {
                let startHour = swap.startHour;
                let startDay = swap.startDay;

                if (!GLOVO.ACCEPTED_HOURS[startDay].includes(startHour)) continue;

                const assign = await assignSwap(swap.id, swap.startAt, swap.endAt);
                
                if (!assign.success) return console.log(`Failed to assign swap! - ${swap.error}`);
                console.log(`Successfully assigned swap for ${swap.startAt}`);

                if (DISCORD.ENABLED) await webhook(`@everyone Found and assigned a swap for ${swap.startAt}`);

                return true;
            }
        }, 3000 * i)
    });
}

async function refreshShifts() {
    GLOVO.DATES.forEach(async (date, i) => {

        setTimeout(async () => {
            const shifts = await getShifts(date);
            if (!shifts.success && DEBUG) return console.log(`Failed to fetch shifts! - ${shifts.error} - ${date}`);

            for (const shift of shifts.shifts) {
                let startHour = shift.startHour;
                let startDay = shift.startDay;

                if (!GLOVO.ACCEPTED_HOURS[startDay].includes(startHour)) continue;

                const assign = await assignShift(shift.id, shift.startAt, shift.endAt);
                
                if (!assign.success && DEBUG) return console.log(`Failed to assign shift! - ${assign.error}`);
                console.log(`Successfully assigned shift for ${shift.startAt}`);

                if (DISCORD.ENABLED) await webhook(`@everyone Found and assigned a shift for ${shift.startAt}`);

                return true;
            }
        }, 3000 * i)
    });
}

setInterval(async () => {
    const data = await fs.readFile("./src/cookies.json", "utf-8");
    const cookies = JSON.parse(data);

    let currentTimestamp = Math.floor(Date.now() / 1000);
    let tokenExpiresAt = cookies.TOKEN_EXPIRES_AT;

    if (currentTimestamp < tokenExpiresAt) {
        refreshShifts();
        refreshSwaps();
    } else {
        console.log("Token expired, relogging...");
        await initLogin();
    }

}, 3000 * GLOVO.DATES.length);