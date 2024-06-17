const {Sequelize} = require("sequelize");

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "./db.sqlite",
	logging: false,
});

try {
	sequelize.authenticate();
	console.log("Connection to the database has been established successfully.");
} catch (error) {
	console.error("Unable to connect to the database:", error);
}

const accessToken = sequelize.define("AccessToken", {
	accessToken: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	refreshTime: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
});

sequelize.sync({force: true});

module.exports = {
	accessToken,
};
