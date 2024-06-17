const fetch = require("node-fetch");
const sendWebhook = require("./sendWebhook");

const db = require("./db/models")
const config = require("../config");

module.exports = async (id) => {
    try {

        const accessTokens = await db.accessToken.findOne({
            where: {
                id: 1
            }
        })

        const data = await fetch(`https://api.glovoapp.com/v4/scheduling/slots/${id}`, {
            method: 'PUT',
            headers: {
                "authorization": accessTokens.accessToken,
                ...config.defaultHeaders
            },
            body: JSON.stringify({"storeAddressId":null,"booked":true})
        }).then(res => res.json());

        if (data.error) {
            if (data.error.message == "Invalid access token") {
                console.log(`Invalid access token, refreshing...`);
                await refreshToken();

                return { success: false };
            }

            console.log(`Failed to book slot: ${data.error.message}`);

            return { success: false };
        }

        return { success: true };
    } catch (e) {
        await sendWebhook(`Failed to book a slot: ${e.message}`);
        console.log(`Failed to book a slot: ${e.message}`);

        return { success: false };
    }
}
