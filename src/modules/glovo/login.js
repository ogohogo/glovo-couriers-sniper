const axios = require('axios');
const { GLOVO, PROXY } = require('../../config');

module.exports = async () => {
    try {
        const config = {
            url: `${GLOVO.BASE_API_URL}/iam-login/v2/auth`,
            method: 'POST',
            headers: GLOVO.DEFAULT_HEADERS,
            data: {
                "username": GLOVO.EMAIL,
                "password": GLOVO.PASSWORD,
                "country_code": "gv-pl",
                "device_token": ""
            }
        };

        if (PROXY.ENABLED) config.httpsAgent = new HttpsProxyAgent(PROXY.URL);

        const response = await axios(config);
        const data = response.data;

        if (data.original_message) {
            return { success: false, message: data.original_message };
        }

        return { success: true, ...data };
    } catch (e) {
        return { 
            success: false, 
            message: `An error has occurred while attempting to login! - ${e.message}` 
        };
    }
};