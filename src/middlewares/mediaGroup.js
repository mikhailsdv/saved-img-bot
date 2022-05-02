const {Composer} = require("telegraf")
const {arrEnd} = require("../utils")

const map = new Map()
const mediaTypeKeys = ["photo", "video", "document"]

module.exports = (timeout = 500) =>
	Composer.mount(mediaTypeKeys, (ctx, next) => {
		const message = ctx.message || ctx.channelPost
		if (!message.media_group_id) {
			return next()
		}
		const fromId = ctx.from.id

		if (!map.has(fromId)) {
			//second message (media)
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
		if (mediaTypeKeys.some(mediaType => message[mediaType])) {
			mediaTypeKeys.forEach(mediaType => {
				const messageMedia = message[mediaType]
				if (messageMedia) {
					message.caption && (userMap.text = message.caption)
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
			console.log("exit")
			clearTimeout(userMap.timeout)
			map.delete(fromId)
			next()
		}
	})
