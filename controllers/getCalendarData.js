const fetch = require("node-fetch");
const config = require("../config");
const refreshToken = require("./refreshToken");
const sendWebhook = require("./sendWebhook")

const db = require("./db/models")

module.exports = async () => {
    try {

        const accessTokens = await db.accessToken.findOne({
            where: {
                id: 1
            }
        })

        const data = await fetch(`https://api.glovoapp.com/v4/scheduling/calendar`, {
            headers: {
                "authorization": accessTokens.accessToken,
                ...config.defaultHeaders
            }
        }).then(res => res.json());

        if (data.error) {
            if (data.error.message == "Invalid access token") {
                console.log(`Invalid access token, refreshing...`);
                await refreshToken();
                return { success: false }; 
            }

            console.log(`Failed to get calendar data: ${data.error.message}`);
            return { success: false }; 
        }

        return {
            success: true,
            ...data
        };
    } catch (e) {
	    if (e.message.includes("ECONNRESET")) return { success: false };
        await sendWebhook(`Failed to get calendar data: ${e.message}`);
        console.log(`Failed to get calendar data: ${e.message}`);
        return { success: false }; 
    }
}
