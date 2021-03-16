const { Telegraf, Telegram } = require("telegraf")
const config = require("./config")
const {getDateString, removeSubstr, getTranslitVariants} = require("./functions")
const phrases = require("./phrases")
const DB = require("./api")
const telegram = new Telegram(config.botToken)
const bot = new Telegraf(config.botToken)

const typeParamsMap = {
	gif: "gif_file_id",
	photo: "photo_file_id",
}
const inlineShareButton = [{
	text: phrases.shareViaInline,
	switch_inline_query: ""
}]

bot.use(require("./middlewares/forwardWithText")())
bot.use(require("./middlewares/forwardGifWithText")())
bot.use(require("./middlewares/mediaGroup")())
bot.use(require("./middlewares/gif"))

bot.catch((err, ctx) => {
	console.log(`${getDateString()}: Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.on("forward_with_text", ctx => {
	const from = ctx.from
	const {text, photos, media_group_id} = ctx.forwardWithText
	const replyMessageId = photos[0].message_id

	if (media_group_id) {
		photos.forEach(message => {
			const photo = message.photo[message.photo.length - 1]
			DB.insert({
				table: "files",
				columns: {
					chat_id: from.id,
					type: "photo",
					file_size: photo.file_size,
					file_id: photo.file_id,
					file_unique_id: photo.file_unique_id,
					height: photo.height,
					width: photo.width,
					tags: text,
					message_id: message.message_id,
					media_group_id: media_group_id
				}
			})
		})

		return ctx.replyWithMarkdown(
			phrases.saved_plural_forwardWithOwnCaption, {
				"reply_to_message_id": replyMessageId,
				"reply_markup": {
					"inline_keyboard": [
						[{
							"text": phrases.deleteButton_plural,
							"callback_data": ["delete_media_group", media_group_id].join(",")
						}],
						inlineShareButton,
					]
				},
			}
		)
	}
	else {
		const photo = photos[0].photo[photos[0].photo.length - 1]
		DB.insert({
			table: "files",
			columns: {
				chat_id: from.id,
				type: "photo",
				file_size: photo.file_size,
				file_id: photo.file_id,
				file_unique_id: photo.file_unique_id,
				height: photo.height,
				width: photo.width,
				tags: text,
				message_id: replyMessageId,
				media_group_id: ""
			}
		})

		return ctx.replyWithMarkdown(
			phrases.saved_single_photo_forwardWithOwnCaption, {
				"reply_to_message_id": replyMessageId,
				"reply_markup": {
					"inline_keyboard": [
						[{
							"text": phrases.deleteButton_single_photo,
							"callback_data": ["delete", replyMessageId].join(",")
						}],
						inlineShareButton,
					]
				},
			}
		)
	}
})

bot.on("forward_gif_with_text", ctx => {
	console.log(`${getDateString()}: New saved gif`)
	const from = ctx.from
	const {text, gifMessage} = ctx.forwardGifWithText
	const replyMessageId = gifMessage.message_id
	const gif = gifMessage.animation || gifMessage.document

	DB.insert({
		table: "files",
		columns: {
			chat_id: from.id,
			type: "gif",
			file_size: gif.file_size,
			file_id: gif.file_id,
			file_unique_id: gif.file_unique_id,
			height: gif.height || 0,
			width: gif.width || 0,
			tags: text,
			message_id: replyMessageId,
			media_group_id: ""
		}
	})

	return ctx.replyWithMarkdown(
		phrases.saved_gif_forwardWithOwnCaption, {
			"reply_to_message_id": replyMessageId,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.deleteButton_gif,
						"callback_data": ["delete", replyMessageId].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	)
})

bot.on("media_group", ctx => {
	console.log(`${getDateString()}: New saved album`)
	const from = ctx.mediaGroup[0].from
	const messageWidthCaption = ctx.mediaGroup.find(message => message.caption !== undefined)
	const caption = messageWidthCaption ? messageWidthCaption.caption : ""
	const isForwarded = !!(ctx.mediaGroup[0].forward_from_chat || ctx.mediaGroup[0].forward_from || false)
	const mediaGroupId = Number(ctx.mediaGroup[0].media_group_id)
	const replyMessageId = ctx.mediaGroup[0].message_id

	ctx.mediaGroup
	.filter(message => message.photo)
	.forEach(message => {
		const photo = message.photo[message.photo.length - 1]
		DB.insert({
			table: "files",
			columns: {
				chat_id: from.id,
				type: "photo",
				file_size: photo.file_size,
				file_id: photo.file_id,
				file_unique_id: photo.file_unique_id,
				height: photo.height,
				width: photo.width,
				tags: caption ? caption : "",
				message_id: message.message_id,
				media_group_id: mediaGroupId
			}
		})
	})

	const text = (() => {
		if (!caption) return phrases.saved_plural_withoutCaption;
		if (caption && isForwarded) return phrases.saved_plural_forwardWithCaption;
		if (caption && !isForwarded) return phrases.saved_plural_directWithCaption;
	})();
	return ctx.replyWithMarkdown(text, {
			"reply_to_message_id": replyMessageId,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.deleteButton_plural,
						"callback_data": ["delete_media_group", mediaGroupId].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	)
	//return ctx.reply(`total: ${ctx.mediaGroup.length}`)
})

bot.start(async ctx => {
	console.log(`${getDateString()}: Start`)
	ctx.replyWithMarkdown(phrases.start, {
		reply_markup: {
			inline_keyboard: [
				[{
					text: phrases.tryInline,
					switch_inline_query: ""
				}]
			]
		}
	})
	const from = ctx.from
	const isUserExist = await DB.has({
		table: "users",
		where: {
			chat_id: from.id,
		}
	})
	if (!isUserExist) {
		DB.insert({
			table: "users",
			columns: {
				chat_id: from.id,
				username: from.username ? from.username : "",
				first_name: from.first_name,
				language_code: from.language_code ? from.language_code : "",
			}
		})
	}
})

bot.command("donate", ctx => {
	console.log(`${getDateString()}: Donate`)
	return ctx.replyWithMarkdown(phrases.donate)
})

bot.command("hints", ctx => {
	console.log(`${getDateString()}: Hints`)
	return ctx.replyWithMarkdown(phrases.hints)
})

bot.on("photo", async ctx => {
	console.log(`${getDateString()}: New saved photo`)
	const message = ctx.update.message
	const from = message.from
	const isForwarded = !!(message.forward_from_chat || message.forward_from || false);
	const caption = message.caption
	const photo = message.photo[message.photo.length - 1]

	if (message.via_bot && message.via_bot.id === config.botId) return;
	
	DB.insert({
		table: "files",
		columns: {
			chat_id: from.id,
			type: "photo",
			file_size: photo.file_size,
			file_id: photo.file_id,
			file_unique_id: photo.file_unique_id,
			height: photo.height,
			width: photo.width,
			tags: caption ? caption : "",
			message_id: message.message_id,
			media_group_id: ""
		}
	})

	const text = (() => {
		if (!caption) return phrases.saved_single_photo_withoutCaption;
		if (caption && isForwarded) return phrases.saved_single_photo_forwardWithCaption;
		if (caption && !isForwarded) return phrases.saved_single_photo_directWithCaption;
	})();
	ctx.replyWithMarkdown(text, {
			"reply_to_message_id": message.message_id,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.deleteButton_single_photo,
						"callback_data": ["delete", message.message_id].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	);
})

bot.on("text", async ctx => {
	const message = ctx.update.message
	const from = message.from
	const isForwarded = !!(message.forward_from_chat || message.forward_from || false)
	
	if (message.reply_to_message) {
		const replyToMessageId = message.reply_to_message.message_id
		if (message.reply_to_message.from.id === config.botId) {
			return ctx.reply(phrases.error_messageWithoutContext)
		}
		const isFileExist = await DB.has({
			table: "files",
			where: {
				chat_id: from.id,
				message_id: replyToMessageId,
			}
		})
		if (!isFileExist) {
			return ctx.reply(phrases.editError_fileNotFound)
		}
		if (!message.text) {
			return ctx.reply(phrases.editError_tagsNotSpecified)
		}

		console.log(`${getDateString()}: Tag update`)

		const file = await DB.select({
			table: "files",
			columns: ["type", "is_deleted", "media_group_id"],
			where: {
				chat_id: from.id,
				message_id: replyToMessageId,
			}
		})
		const isFileDeleted = file[0].is_deleted === 1
		const isGif = file[0].type === "gif"
		const mediaGroupId = file[0].media_group_id
		const isMediaGroup = mediaGroupId !== ""
		const isSinglePhoto = (!isMediaGroup && !isGif)
		if (isMediaGroup) {
			await DB.update({
				table: "files",
				columns: {
					tags: message.text
				},
				where: {
					chat_id: from.id,
					media_group_id: mediaGroupId,
				}
			})
		}
		else {
			await DB.update({
				table: "files",
				columns: {
					tags: message.text
				},
				where: {
					chat_id: from.id,
					message_id: replyToMessageId,
				}
			})
		}

		const text = (() => {
			if (isGif && isFileDeleted) return phrases.tagsUpdated_gif_isDeleted;
			if (isGif && !isFileDeleted) return phrases.tagsUpdated_gif_notDeleted;
			if (isMediaGroup && isFileDeleted) return phrases.tagsUpdated_plural_isDeleted;
			if (isMediaGroup && !isFileDeleted) return phrases.tagsUpdated_plural_notDeleted;
			if (isSinglePhoto && isFileDeleted) return phrases.tagsUpdated_single_photo_isDeleted;
			if (isSinglePhoto && !isFileDeleted) return phrases.tagsUpdated_single_photo_notDeleted;
		})();
		const buttonText = (() => {
			if (isGif && isFileDeleted) return phrases.recoverButton_gif;
			if (isGif && !isFileDeleted) return phrases.deleteButton_gif;
			if (isMediaGroup && isFileDeleted) return phrases.recoverButton_plural;
			if (isMediaGroup && !isFileDeleted) return phrases.deleteButton_plural;
			if (isSinglePhoto && isFileDeleted) return phrases.recoverButton_single_photo;
			if (isSinglePhoto && !isFileDeleted) return phrases.deleteButton_single_photo;
		})();
		return ctx.replyWithMarkdown(text, {
				reply_to_message_id: replyToMessageId,
				reply_markup: {
					inline_keyboard: [
						[{
							text: buttonText,
							callback_data: [isFileDeleted ? "recover" : "delete", replyToMessageId].join(",")
						}],
						inlineShareButton,
					]
				}
			}
		)
	}
	else if (isForwarded) {
		return ctx.reply(phrases.error_noPhoto)
	}
	else {
		return ctx.reply(phrases.error_messageWithoutContext)
	}
})

bot.on("gif", async ctx => {
	console.log(`${getDateString()}: New saved gif`)
	const message = ctx.update.message
	const from = message.from
	const isForwarded = !!(message.forward_from_chat || message.forward_from || false);
	const caption = message.caption
	const animation = message.animation || message.document
	
	DB.insert({
		table: "files",
		columns: {
			chat_id: from.id,
			type: "gif",
			file_size: animation.file_size,
			file_id: animation.file_id,
			file_unique_id: animation.file_unique_id,
			height: animation.height || 0,
			width: animation.width || 0,
			tags: caption ? caption : "",
			message_id: message.message_id,
			media_group_id: ""
		}
	})

	const text = (() => {
		if (!caption) return phrases.saved_gif_withoutCaption;
		if (caption && isForwarded) return phrases.saved_gif_forwardWithCaption;
		if (caption && !isForwarded) return phrases.saved_gif_directWithCaption;
	})();
	ctx.replyWithMarkdown(text, {
			"reply_to_message_id": message.message_id,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.deleteButton_gif,
						"callback_data": ["delete", message.message_id].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	);
})

bot.on("edited_message", async ctx => {
	console.log(`${getDateString()}: Edited message`)
	const message = ctx.update.edited_message
	const fileMessageId = message.reply_to_message ? message.reply_to_message.message_id : message.message_id;
	const from = message.from
	const newTags = message.caption || message.text || false
	const isFileExist = await DB.has({
		table: "files",
		where: {
			chat_id: from.id,
			message_id: fileMessageId,
		}
	});

	if (!isFileExist) {
		return ctx.reply(phrases.editError_fileNotFound)
	}
	if (!newTags) {
		return ctx.reply(phrases.editError_tagsNotSpecified)
	}
	
	const file = await DB.select({
		table: "files",
		columns: ["type", "is_deleted", "media_group_id"],
		where: {
			chat_id: from.id,
			message_id: fileMessageId,
		}
	})
	const isFileDeleted = file[0].is_deleted === 1
	const isGif = file[0].type === "gif"
	const mediaGroupId = file[0].media_group_id
	const isMediaGroup = mediaGroupId !== ""
	const isSinglePhoto = (!isMediaGroup && !isGif)
	if (isMediaGroup) {
		await DB.update({
			table: "files",
			columns: {
				tags: newTags
			},
			where: {
				chat_id: from.id,
				media_group_id: mediaGroupId,
			}
		})
	}
	else {
		await DB.update({
			table: "files",
			columns: {
				tags: newTags
			},
			where: {
				chat_id: from.id,
				message_id: fileMessageId,
			}
		})
	}

	const text = (() => {
		if (isGif && isFileDeleted) return phrases.tagsUpdated_gif_isDeleted;
		if (isGif && !isFileDeleted) return phrases.tagsUpdated_gif_notDeleted;
		if (isMediaGroup && isFileDeleted) return phrases.tagsUpdated_plural_isDeleted;
		if (isMediaGroup && !isFileDeleted) return phrases.tagsUpdated_plural_notDeleted;
		if (isSinglePhoto && isFileDeleted) return phrases.tagsUpdated_single_photo_isDeleted;
		if (isSinglePhoto && !isFileDeleted) return phrases.tagsUpdated_single_photo_notDeleted;
	})();
	const buttonText = (() => {
		if (isGif && isFileDeleted) return phrases.recoverButton_gif;
		if (isGif && !isFileDeleted) return phrases.deleteButton_gif;
		if (isMediaGroup && isFileDeleted) return phrases.recoverButton_plural;
		if (isMediaGroup && !isFileDeleted) return phrases.deleteButton_plural;
		if (isSinglePhoto && isFileDeleted) return phrases.recoverButton_single_photo;
		if (isSinglePhoto && !isFileDeleted) return phrases.deleteButton_single_photo;
	})();
	return ctx.replyWithMarkdown(text, {
			reply_to_message_id: fileMessageId,
			reply_markup: {
				inline_keyboard: [
					[{
						text: buttonText,
						callback_data: [isFileDeleted ? "recover" : "delete", fileMessageId].join(",")
					}],
					inlineShareButton,
				]
			}
		}
	)
})

bot.on("inline_query", async ctx => {
	const inlineQuery = ctx.update.inline_query
	console.log("inlineQuery", inlineQuery)
	const from = inlineQuery.from
	let query = inlineQuery.query.trim()
	const page = inlineQuery.offset ? Number(inlineQuery.offset) : 0

	const ownCaptionMatch = query.match(/\s?["«](.+?)["»]\s?/)
	const ownCaption = ownCaptionMatch ? ownCaptionMatch[1] : false
	ownCaptionMatch ? (query = removeSubstr(query, ownCaptionMatch.index, ownCaptionMatch[0].length)) : (query = query.replace(/["«].*?$/, ""))

	query = query.toLowerCase().trim()
	
	if (query === ",") return ctx.answerInlineQuery([], {
		cache_time: 2,
		switch_pm_text: "Введите больше символов",
		switch_pm_parameter: "start",
		is_personal: true,
	})
	else if (query.length === 0 && from.id === 1343190364) {
		const usersFiles = await DB.select({
			table: "files",
			columns: [
				"id",
				"type",
				"chat_id",
				"file_id",
				"file_size",
				"file_unique_id",
				"height",
				"width",
				"tags",
				"message_id",
				"used_count",
				"date",
			],
			where: {
				"chat_id[!=]": 573560893,
			},
			order: {
				date: "DESC",
			}
		})
		const results = usersFiles
		.slice(page * 50, page * 50 + 50)
		.map(file => {
			let result = {
				type: file.type,
				id: file.id,
				[typeParamsMap[file.type]]: file.file_id,
			}
			if (ownCaption) {
				result.caption = ownCaption
			}
			return result
		})
		return ctx.answerInlineQuery(results, {
			cache_time: 2,
			next_offset: usersFiles.slice((page + 1) * 50, (page + 1) * 50 + 50).length > 0 ? page + 1 : "",
			is_personal: true,
		})
	}
	else if (query.length === 0) {
		const usersFiles = await DB.select({
			table: "files",
			columns: [
				"id",
				"type",
				"chat_id",
				"file_id",
				"file_size",
				"file_unique_id",
				"height",
				"width",
				"tags",
				"message_id",
				"used_count",
				"date",
			],
			where: {
				chat_id: from.id,
				is_deleted: 0,
			},
			order: {
				date: "DESC",
			}
		})
		if (usersFiles.length > 0) {
			const results = usersFiles
			.slice(page * 50, page * 50 + 50)
			.map(file => {
				let result = {
					type: file.type,
					id: file.id,
					[typeParamsMap[file.type]]: file.file_id,
				}
				if (ownCaption) {
					result.caption = ownCaption
				}
				return result
			})
			return ctx.answerInlineQuery(results, {
				cache_time: 2,
				next_offset: usersFiles.slice((page + 1) * 50, (page + 1) * 50 + 50).length > 0 ? page + 1 : "",
				is_personal: true,
			})
		}
		else {
			return ctx.answerInlineQuery([], {
				cache_time: 2,
				switch_pm_text: phrases.youHaveNoPictures,
				switch_pm_parameter: "start",
				next_offset: "",
				is_personal: true,
			})
		}
	}
	const usersFiles = await DB.select({
		table: "files",
		columns: [
			"id",
			"type",
			"chat_id",
			"file_id",
			"file_size",
			"file_unique_id",
			"height",
			"width",
			"tags",
			"message_id",
			"used_count",
			"date",
		],
		where: {
			chat_id: from.id,
			is_deleted: 0,
		},
		order: {
			date: "DESC",
		}
	})
	if (usersFiles.length === 0) {
		return ctx.answerInlineQuery([], {
			cache_time: 2,
			switch_pm_text: phrases.youHaveNoPictures,
			switch_pm_parameter: "start",
			next_offset: "",
			is_personal: true,
		})
	}
	let results = []
	const queryVariants = getTranslitVariants(query)

	filedIterator: for (const file of usersFiles) {
		const tags = file.tags.toLowerCase()
		const tagsSplit = tags.split(/\s?,\s?/)

		for (let queryVariant of queryVariants) {
			for (let tag of tagsSplit) {
				tag = tag.trim()
				if (
					queryVariant.length > 0 &&
					tag.length >= 2 &&
					(tag.includes(queryVariant) || queryVariant.includes(tag))
				) {
					!results.includes(file) && results.push(file)
					continue filedIterator
				}
			}
			if (
				(queryVariant.length > 0 && tags.length >= 2 && tags.includes(queryVariant)) ||
				(tags.length > 0 && queryVariant.length >= 2 && queryVariant.includes(tags))
			) {
				!results.includes(file) && results.push(file)
				continue filedIterator
			}
			else if (
				queryVariant.length > 0 &&
				tags.length > 0 &&
				queryVariant === tags
			) {
				!results.includes(file) && results.push(file)
				continue filedIterator
			}
		}
	}
	results_ = results
	.slice(page * 50, page * 50 + 50)
	.map(file => {
		let result = {
			type: file.type,
			id: file.id,
			[typeParamsMap[file.type]]: file.file_id,
		}
		if (ownCaption) {
			result.caption = ownCaption
		}
		return result
	})
	let body = {
		cache_time: 2,
		next_offset: results.slice((page + 1) * 50, (page + 1) * 50 + 50).length > 0 ? page + 1 : "",
		is_personal: true,
	}
	console.log(results_)
	if (results_.length === 0 && page === 0) {
		body.switch_pm_text = phrases.nothingFound
		body.switch_pm_parameter = "start"
	}
	ctx.answerInlineQuery(results_, body)
})

bot.on("callback_query", async ctx => {
	console.log(`${getDateString()}: Button pressed`)
	const callbackQuery = ctx.update.callback_query
	const from = callbackQuery.from
	const data = callbackQuery.data.split(",")
	const command = data[0]

	ctx.answerCbQuery()

	if (command === "delete") {
		const messageId = Number(data[1])
		const isGif = await DB.has({
			table: "files",
			where: {
				chat_id: from.id,
				message_id: messageId,
				type: "gif",
			}
		})
		DB.update({
			table: "files",
			columns: {
				is_deleted: 1
			},
			where: {
				chat_id: from.id,
				message_id: messageId
			}
		})
		return telegram.editMessageText(
			from.id,
			callbackQuery.message.message_id,
			null,
			isGif ? phrases.deleted_gif : phrases.deleted_single_photo,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: isGif ? phrases.recoverButton_gif : phrases.recoverButton_single_photo,
							callback_data: ["recover", messageId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
	else if (command === "recover") {
		const messageId = Number(data[1])
		const isGif = await DB.has({
			table: "files",
			where: {
				chat_id: from.id,
				message_id: messageId,
				type: "gif",
			}
		})
		DB.update({
			table: "files",
			columns: {
				is_deleted: 0
			},
			where: {
				chat_id: from.id,
				message_id: messageId
			}
		})
		return telegram.editMessageText(
			from.id,
			callbackQuery.message.message_id,
			null,
			isGif ? phrases.recovered_gif : phrases.recovered_single_photo,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: isGif ? phrases.deleteButton_gif : phrases.deleteButton_single_photo,
							callback_data: ["delete", messageId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
	else if (command === "delete_media_group") {
		const mediaGroupId = Number(data[1])
		DB.update({
			table: "files",
			columns: {
				is_deleted: 1
			},
			where: {
				chat_id: from.id,
				media_group_id: mediaGroupId
			}
		})
		return telegram.editMessageText(from.id, callbackQuery.message.message_id, null, phrases.deleted_plural, {
			reply_markup: {
				inline_keyboard: [
					[{
						text: phrases.recoverButton_plural,
						callback_data: ["recover_media_group", mediaGroupId].join(",")
					}],
					inlineShareButton,
				]
			},
			parse_mode: "Markdown",
		})
	}
	else if (command === "recover_media_group") {
		const mediaGroupId = Number(data[1])
		DB.update({
			table: "files",
			columns: {
				is_deleted: 0
			},
			where: {
				chat_id: from.id,
				media_group_id: mediaGroupId
			}
		})
		return telegram.editMessageText(from.id, callbackQuery.message.message_id, null, phrases.recovered_plural, {
			reply_markup: {
				inline_keyboard: [
					[{
						text: phrases.deleteButton_plural,
						callback_data: ["delete_media_group", mediaGroupId].join(",")
					}],
					inlineShareButton,
				]
			},
			parse_mode: "Markdown",
		})
	}
})

bot.on("chosen_inline_result", async ctx => {
	console.log(`${getDateString()}: Chosen inline result`)
	const fileId = Number(ctx.update.chosen_inline_result.result_id)
	const from = ctx.from
	const file = await DB.select({
		table: "files",
		columns: ["used_count"],
		where: {
			chat_id: from.id,
			id: fileId,
		}
	})
	DB.update({
		table: "files",
		columns: {
			used_count: file[0]["used_count"] + 1
		},
		where: {
			chat_id: from.id,
			id: fileId,
		}
	})
})

bot.launch()

/*start - 😎 Начать
hints - 💡 Советы
donate - 💸 Задонатить*/