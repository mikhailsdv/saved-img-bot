const {Composer} = require("telegraf")

const map = new Map()

module.exports = (timeout = 400) => Composer.mount(["photo", "text"], (ctx, next) => {
	const message = ctx.message || ctx.channelPost
	const fromId = ctx.from.id

	if (!map.has(fromId)) {
		map.set(fromId, {
			text: null,
			media_group_id: null,
			photos: [],
			timeout: setTimeout(() => {
				let userMap = map.get(fromId)
				if (userMap.photos.length > 0) {
					ctx.updateSubTypes.push("forward_with_text")
					ctx.forwardWithText = {
						photos: userMap.photos,
						text: userMap.text,
						media_group_id: userMap.media_group_id,
					}
				}
				map.delete(fromId)
				return next()
			}, timeout)
		})
	}

	let userMap = map.get(fromId)
	if (message.text && userMap.text === null && userMap.photos.length === 0) {
		userMap.text = message.text
	}
	else if (message.photo && userMap.text !== null) {
		if (message.media_group_id && !userMap.media_group_id) {
			userMap.media_group_id = message.media_group_id
		}
		userMap.photos.push(message)
	}
	else {
		clearTimeout(userMap.timeout)
		map.delete(fromId)
		return next()
	}
})