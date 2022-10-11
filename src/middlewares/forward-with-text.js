const {Composer} = require("telegraf")
const types = require("../types")

const map = new Map()
const mediaTypeKeys = Object.keys(types)

module.exports = (timeout = 500) =>
	Composer.mount([...mediaTypeKeys, "text"], (ctx, next) => {
		const message = ctx.message || ctx.channelPost
		const fromId = ctx.from.id

		if (map.has(fromId)) {
			//second message (media)
			const userMap = map.get(fromId)
			const mediaType = mediaTypeKeys.find(
				mediaType => message[mediaType]
			)
			if (mediaType) {
				message.media_group_id &&
					(userMap.media_group_id = message.media_group_id)
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
		} else {
			if (
				!(
					ctx.updateSubTypes[0] === "text" &&
					ctx.updateSubTypes.length === 1 &&
					message?.text?.length > 0
				)
			) {
				return next()
			}
			map.set(fromId, {
				text: message.text,
				media_group_id: undefined,
				tags_message_id: message.message_id,
				media: [],
				timeout: setTimeout(() => {
					const userMap = map.get(fromId)
					if (userMap.media.length > 0) {
						ctx.updateSubTypes.push("forward_with_text")
						ctx.forwardWithText = {
							media: userMap.media,
							text: userMap.text,
							media_group_id: userMap.media_group_id,
							tags_message_id: userMap.tags_message_id,
						}
					}
					map.delete(fromId)
					next()
				}, timeout),
			})
		}
	})
