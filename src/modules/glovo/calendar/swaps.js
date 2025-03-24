const { GLOVO, PROXY } = require('../../../config');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');
const fs = require('fs').promises;

function addOneDay(dateString) {
    // Create a Date object from the input string
    const date = new Date(dateString);

    // Add one day
    date.setDate(date.getDate() + 1);

    // Format the new date back to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

module.exports = async (date) => {
    try {

        const cookieData = await fs.readFile("./src/cookies.json", "utf-8");
        const { EMPLOYEE_ID, CITY_ID, ACCESS_TOKEN } = JSON.parse(cookieData);

        const config = {
            url: `${GLOVO.BASE_API_URL}/rooster/v3/employees/${EMPLOYEE_ID}/available_swaps`,
            params: {
                start_at: `${date}T23:00:00.000Z`,
                end_at: `${addOneDay(date)}T22:59:59.999Z`,
                starting_point_ids: CITY_ID,
                city_id: CITY_ID,
                with_time_zone: 'Europe/Warsaw'
            },
            headers: {
                'authorization': `Bearer ${ACCESS_TOKEN}`,
                ...GLOVO.DEFAULT_HEADERS
            }
        };

        if (PROXY.ENABLED) config.httpsAgent = new HttpsProxyAgent(PROXY.URL);

        const response = await axios(config);
        const data = response.data;

        if (data.length == 0) return { success: false, error: `ERR_NO_SWAPS` }

        const swaps = data.map(swap => {
            const startHour = new Date(swap.start).getHours();
            const startDay = new Date(swap.start).getDay();

            return {
                id: swap.shift_id,
                startHour: startHour,
                startDay: startDay,
                startAt: swap.start,
                endAt: swap.end
            };
        });

        return { success: true, swaps };

    } catch (e) {
        console.log(e);
        return { success: false, error: `ERR_SWAPS_UNEXPECTED` }
    }
}