const { GLOVO, PROXY } = require("../../../config")
const fs = require('fs').promises;
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = async (shiftId, startAt, endAt) => {
    try {

        const cookieData = await fs.readFile("./src/cookies.json", "utf-8");
        const { EMPLOYEE_ID, CITY_ID, ACCESS_TOKEN } = JSON.parse(cookieData);

        const config = {
            url: `${GLOVO.BASE_API_URL}/rooster/v2/unassigned_shifts/${shiftId}/assign`,
            method: 'POST',
            headers: {
                "authorization": `Bearer ${ACCESS_TOKEN}`,
                ...GLOVO.DEFAULT_HEADERS
            },
            data: {
                "id": shiftId,
                "start_at": startAt,
                "end_at": endAt,
                "starting_point_id": CITY_ID,
                "employee_ids": [EMPLOYEE_ID]
            }
        };

        if (PROXY.ENABLED) config.httpsAgent = new HttpsProxyAgent(PROXY.URL);

        const response = await axios(config);
        const data = response.data;

        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, error: `ERR_ASSIGN_UNEXPECTED` }
    }
}