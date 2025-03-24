const { GLOVO, PROXY } = require('../../../config.js.example');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');
const fs = require('fs').promises;

module.exports = async (date) => {
    try {

        const cookieData = await fs.readFile("./src/cookies.json", "utf-8");
        const { EMPLOYEE_ID, CITY_ID, ACCESS_TOKEN } = JSON.parse(cookieData);

        const config = {
            url: `${GLOVO.BASE_API_URL}/rooster/v3/magpie/employees/${EMPLOYEE_ID}/available_unassigned_shifts`,
            params: {
                starting_point_ids: CITY_ID,
                date: date,
                start_hour: '00:00',
                end_hour: '23:59',
                order_by: 'EARLIEST_FIRST',
                only_high_demand: false,
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

        if (data.content && data.content.length === 0) return { success: false, error: "ERR_NO_SHIFTS" };

        const shifts = data.content.map(shift => {
            const startHour = new Date(shift.start_at).getHours();
            const startDay = new Date(shift.start_at).getDay();

            return {
                id: shift.id,
                startHour: startHour,
                startDay: startDay,
                startAt: shift.start_at,
                endAt: shift.end_at
            };
        });

        return { success: true, shifts };
    } catch (e) {
        console.log(e);
        return { success: false, error: "ERR_SHIFTS_UNEXPECTED" };
    }
}