const {Composer} = require("telegraf")

const map = new Map()

module.exports = (timeout = 400) => Composer.mount(["document", "text"], (ctx, next) => {
	const message = ctx.message || ctx.channelPost
	const fromId = ctx.from.id

	if (!map.has(fromId)) {
		map.set(fromId, {
			gifMessage: null,
			timeout: setTimeout(() => {
				map.delete(fromId)
				return next()
			}, timeout)
		})
	}

	let userMap = map.get(fromId)
	if (message.animation && userMap.gifMessage === null) {
		userMap.gifMessage = message
	}
	else if (message.text && userMap.gifMessage !== null) {
		ctx.updateSubTypes.push("forward_gif_with_text")
		ctx.forwardGifWithText = {
			gifMessage: userMap.gifMessage,
			text: message.text,
		}
		clearTimeout(userMap.timeout)
		map.delete(fromId)
		return next()
	}
	else {
		clearTimeout(userMap.timeout)
		map.delete(fromId)
		return next()
	}
})