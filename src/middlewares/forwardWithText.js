const {Composer} = require("telegraf")
const {arrEnd} = require("../utils")
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
			if (mediaTypeKeys.some(mediaType => message[mediaType])) {
				mediaTypeKeys.forEach(mediaType => {
					const messageMedia = message[mediaType]
					if (messageMedia) {
						message.media_group_id && (userMap.media_group_id = message.media_group_id)
						messageMedia.message_id = message.message_id
						let messageMedia_ = {
							message_id: message.message_id,
							type: mediaType === "document" ? "gif" : mediaType,
						}
						if (mediaType === "document") {
							if (messageMedia.mime_type === "image/gif") {
								Object.assign(messageMedia_, messageMedia)
								userMap.media.push(messageMedia_)
							} else if (message.animation) {
								Object.assign(messageMedia_, message.animation)
								userMap.media.push(messageMedia_)
							}
						} else if (mediaType === "photo") {
							Object.assign(messageMedia_, arrEnd(messageMedia))
							userMap.media.push(messageMedia_)
						} else {
							Object.assign(messageMedia_, messageMedia)
							userMap.media.push(messageMedia_)
						}
					}
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
