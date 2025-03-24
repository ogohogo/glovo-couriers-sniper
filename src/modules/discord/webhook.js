const { DISCORD } = require("../../config.js.example");

module.exports = async (message) => {
    try {
        const data = await fetch(DISCORD.WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: message })
        }).then(res => res.json());

        return { success: true };
    } catch (e) {
        return { success: false, error: `ERR_DISCORD_UNEXPECTED` }
    }
}