const logger = require("node-color-log");

module.exports = {
	red: (...args) => {
		logger.color("white").bgColor("red").log(...args);
	},
	green: (...args) => {
		logger.color("white").bgColor("green").log(...args);
	},
	def: (...args) => {
		logger.color("yellow").bold().log(...args);
	},
}