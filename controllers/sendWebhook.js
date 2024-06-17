const fetch = require("node-fetch");
const config = require("../config");

module.exports = async (message) => {
    try {
        await fetch(config.discordWebhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message
            })
        })
    } catch (e) {
        return console.log(`Failed to send webhook: ${e.message}`);
    }

}
