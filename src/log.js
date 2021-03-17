const logger = require("node-color-log")
const {getDateString} = require("./utils")

module.exports = {
	red: (...args) => {
		logger.color("white").bgColor("red").log(getDateString() + ":", ...args);
	},
	green: (...args) => {
		logger.color("white").bgColor("green").log(getDateString() + ":", ...args);
	},
	def: (...args) => {
		logger.color("yellow").bold().log(getDateString() + ":", ...args);
	},
}