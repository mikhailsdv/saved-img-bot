const path = require("path")
require("dotenv").config({path: path.resolve(__dirname, "../.env")})
const {
	BOT_TOKEN,
	BOT_USERNAME,
	MYSQL_HOST,
	MYSQL_USER,
	MYSQL_PASSWORD,
	MYSQL_DATABASE,
	FILES_TABLE_NAME,
	USERS_TABLE_NAME,
} = process.env

module.exports = {
	BOT_TOKEN,
	BOT_USERNAME,
	MYSQL_HOST,
	MYSQL_USER,
	MYSQL_PASSWORD,
	MYSQL_DATABASE,
	FILES_TABLE_NAME,
	USERS_TABLE_NAME,
}
