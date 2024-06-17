const config = require("../config");
const sendWebhook = require("./sendWebhook");

const db = require("./db/models")

const fetch = require("node-fetch")

module.exports = async () => {
    try {
        const data = await fetch(`https://api.glovoapp.com/oauth/refresh`, {
            method: 'POST',
            headers: config.defaultHeaders,
            body: JSON.stringify({
                refreshToken: config.refreshToken
            })
        }).then(res => res.json());

        if (!data.accessToken) return { success: false };

        console.log(`Refreshed access token at ${new Date().toLocaleString()}`);

        await db.accessToken.update({
            accessToken: data.accessToken,
            refreshTime: parseInt((Date.now() / 1000).toFixed()),
        }, {
            where: {
                id: 1
            }
        })

        return { success: true }

    } catch (e) {
        await sendWebhook(`Failed to refresh token: ${e.message}`);
        console.log(`Failed to refresh token: ${e.message}`);
        return { success: false }
    }
}
