const {Composer} = require("telegraf")

module.exports = Composer.mount(["document"], (ctx, next) => {
	const message = ctx.update.message
	if (!message.animation) {
		return next()
	}
	else {
		ctx.updateSubTypes.push("gif")
		return next()
	}
})