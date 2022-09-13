const {Composer} = require("telegraf")
const types = require("../types")

const map = new Map()
const mediaTypeKeys = Object.keys(types)

module.exports = (timeout = 500) =>
	Composer.mount(mediaTypeKeys, (ctx, next) => {
		const message = ctx.message || ctx.channelPost
		if (!message.media_group_id) {
			return next()
		}
		const fromId = ctx.from.id

		if (!map.has(fromId)) {
			map.set(fromId, {
				text: undefined,
				media_group_id: message.media_group_id,
				media: [],
				timeout: setTimeout(() => {
					const userMap = map.get(fromId)
					if (userMap.media.length > 0) {
						ctx.updateSubTypes.push("media_group")
						ctx.mediaGroup = {
							media: userMap.media,
							text: userMap.text,
							media_group_id: userMap.media_group_id,
						}
					}
					map.delete(fromId)
					next()
				}, timeout),
			})
		}

		const userMap = map.get(fromId)
		const mediaType = mediaTypeKeys.find(mediaType => message[mediaType])
		if (mediaType) {
			message.caption && (userMap.text = message.caption)
			message.media_group_id && (userMap.media_group_id = message.media_group_id)
			const mediaItem = types[mediaType].extractMediaItem(message)
			userMap.media.push({
				...mediaItem,
				message_id: message.message_id,
				type: mediaType,
			})
		} else {
			clearTimeout(userMap.timeout)
			map.delete(fromId)
			next()
		}
	})
