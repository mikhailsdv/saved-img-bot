const {Composer} = require("telegraf")

module.exports = Composer.mount(["document"], (ctx, next) => {
	const message = ctx.update.message
	if (
		message.animation ||
		(message.document && message.document.mime_type === "image/gif")
	) {
		ctx.updateSubTypes.push("gif")
	}
	next()
})
