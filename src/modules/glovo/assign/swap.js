const { GLOVO, PROXY } = require("../../../config.js.example")
const fs = require('fs').promises;
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = async (shiftId, startAt, endAt) => {
    try {

        const cookieData = await fs.readFile("./src/cookies.json", "utf-8");
        const { ACCESS_TOKEN } = JSON.parse(cookieData);

        const config = {
            url: `${GLOVO.BASE_API_URL}/rooster/v2/shifts/${shiftId}/swap`,
            method: 'PUT',
            headers: {
                "authorization": `Bearer ${ACCESS_TOKEN}`,
                ...GLOVO.DEFAULT_HEADERS
            },
            data: {
                "shiftId": shiftId,
                "start_at": startAt,
                "end_at": endAt
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