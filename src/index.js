const { Telegraf, Telegram } = require("telegraf")
const config = require("./config")
const phrases = require("./phrases")
const {
	saveFile,
	createUser,
	isFileExist,
	isUserExist,
	getFile,
	getUserFiles,
	getUserFilesOfType,
	updateFileTags,
	updateMediaGroupTags,
	setFileDeletedState,
	setMediaGroupDeletedState,
	increaseUsedCount,
} = require("./api")
const {
	removeSubstr,
	getTranslitVariants,
	arrEnd,
	log,
} = require("./utils")
const telegram = new Telegram(config.BOT_TOKEN)
const bot = new Telegraf(config.BOT_TOKEN)

const typeParamsMap = {
	gif: "gif_file_id",
	photo: "photo_file_id",
	video: "video_file_id",
}
const inlineShareButton = [{
	text: phrases.share_via_inline,
	switch_inline_query: ""
}]

bot.use(require("./middlewares/forwardWithText")())
bot.use(require("./middlewares/mediaGroup")())
bot.use(require("./middlewares/gif"))


bot.on("message", (ctx, next) => {
	const message = ctx.message
	if (message?.via_bot?.id !== config.BOT_ID) next();
})

bot.catch((err, ctx) => {
	log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.start(async ctx => {
	log("Command /start")
	ctx.replyWithMarkdown(phrases.start, {
		reply_markup: {
			inline_keyboard: [
				[{
					text: phrases.try_inline,
					switch_inline_query: ""
				}]
			]
		}
	})
	const from = ctx.from
	const userExist = await isUserExist({
		chat_id: from.id,
	})
	if (!userExist) {
		createUser({
			chat_id: from.id,
			username: from.username,
			first_name: from.first_name,
			language_code: from.language_code,
		})
	}
})

bot.command("donate", ctx => {
	log("Command /donate")
	return ctx.replyWithMarkdown(phrases.donate)
})

bot.command("hints", ctx => {
	log("Command /hints")
	return ctx.replyWithMarkdown(phrases.hints)
})

bot.on("forward_with_text", ctx => {
	const chatId = ctx.chat.id
	const {text, media, media_group_id, tags_message_id} = ctx.forwardWithText

	if (media_group_id) {
		media.forEach(mediaItem => {
			saveFile({
				chat_id: chatId,
				type: mediaItem.type,
				file_size: mediaItem.file_size,
				file_id: mediaItem.file_id,
				file_unique_id: mediaItem.file_unique_id,
				height: mediaItem.height,
				width: mediaItem.width,
				tags: text,
				file_message_id: mediaItem.message_id,
				tags_message_id: tags_message_id,
				media_group_id: media_group_id,
			})
		})

		ctx.replyWithMarkdown(
			phrases.saved_plural_own_caption, {
				"reply_to_message_id": media[0].message_id,
				"reply_markup": {
					"inline_keyboard": [
						[{
							"text": phrases.button_delete_plural,
							"callback_data": ["delete_media_group", media_group_id].join(",")
						}],
						inlineShareButton,
					]
				},
			}
		)
	}
	else {
		const mediaItem = media[0]
		saveFile({
			chat_id: chatId,
			type: mediaItem.type,
			file_size: mediaItem.file_size,
			file_id: mediaItem.file_id,
			file_unique_id: mediaItem.file_unique_id,
			height: mediaItem.height,
			width: mediaItem.width,
			tags: text,
			file_message_id: mediaItem.message_id,
			tags_message_id: tags_message_id,
		})

		ctx.replyWithMarkdown(
			phrases.saved_single_own_caption, {
				"reply_to_message_id": mediaItem.message_id,
				"reply_markup": {
					"inline_keyboard": [
						[{
							"text": phrases.button_delete_single,
							"callback_data": ["delete", mediaItem.message_id].join(",")
						}],
						inlineShareButton,
					]
				},
			}
		)
	}
})

bot.on("media_group", ctx => {
	const chatId = ctx.chat.id
	const {text, media, media_group_id} = ctx.mediaGroup
	
	media.forEach(mediaItem => {
		saveFile({
			chat_id: chatId,
			type: mediaItem.type,
			file_size: mediaItem.file_size,
			file_id: mediaItem.file_id,
			file_unique_id: mediaItem.file_unique_id,
			height: mediaItem.height,
			width: mediaItem.width,
			tags: text,
			file_message_id: mediaItem.message_id,
			tags_message_id: mediaItem.message_id,
			media_group_id: media_group_id,
		})
	})

	ctx.replyWithMarkdown(
		text ? phrases.saved_plural_own_caption : phrases.saved_plural_no_caption, {
			"reply_to_message_id": media[0].message_id,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.button_delete_plural,
						"callback_data": ["delete_media_group", media_group_id].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	)
})

bot.on(["photo", "video", "gif"], async ctx => {
	const types = [
		{
			name: "photo",
			extractMediaItem: message => arrEnd(message.photo),
		},
		{
			name: "video",
			extractMediaItem: message => message.video,
		},
		{
			name: "gif",
			extractMediaItem: message => message.animation || message.document,
		},
	]
	const message = ctx.message
	const chatId = ctx.chat.id
	const messageId = message.message_id
	const caption = message.caption
	const type = types.find(item => ctx.updateSubTypes.includes(item.name))
	const mediaItem = type.extractMediaItem(message)
	log(`New saved ${type.name}`)
	
	saveFile({
		chat_id: chatId,
		type: type.name,
		file_size: mediaItem.file_size,
		file_id: mediaItem.file_id,
		file_unique_id: mediaItem.file_unique_id,
		height: mediaItem.height,
		width: mediaItem.width,
		tags: caption,
		file_message_id: messageId,
		tags_message_id: messageId,
	})

	ctx.replyWithMarkdown(
		caption ? phrases.saved_single_own_caption : phrases.saved_single_no_caption, {
			"reply_to_message_id": messageId,
			"reply_markup": {
				"inline_keyboard": [
					[{
						"text": phrases.button_delete_single,
						"callback_data": ["delete", messageId].join(",")
					}],
					inlineShareButton,
				]
			},
		}
	)
})

bot.on("text", async ctx => {
	const message = ctx.message
	const chatId = ctx.chat.id
	const messageId = message.message_id
	const isForwarded = Boolean(message.forward_from_chat || message.forward_from || false)
	
	if (message.reply_to_message) {
		const replyToMessageId = message.reply_to_message.message_id
		if (message.reply_to_message.from.id === config.BOT_ID) {
			return ctx.reply(phrases.error_message_without_context)
		}

		const fileExist = await isFileExist({
			chat_id: chatId,
			message_id: replyToMessageId,
		})
		if (!fileExist) {
			return ctx.reply(phrases.error_edit_file_not_found)
		}
		if (!message.text) {
			return ctx.reply(phrases.error_edit_tags_not_specified)
		}

		log("Tag update")

		const file = await getFile({
			chat_id: chatId,
			message_id: replyToMessageId,
		})
		const isFileDeleted = file.is_deleted === 1
		const mediaGroupId = file.media_group_id
		const isMediaGroup = mediaGroupId !== ""

		if (isMediaGroup) {
			await updateMediaGroupTags({
				tags: message.text,
				chat_id: chatId,
				media_group_id: mediaGroupId,
			})
		}
		else {
			await updateFileTags({
				tags: message.text,
				chat_id: chatId,
				file_message_id: replyToMessageId,
			})
		}

		return ctx.replyWithMarkdown(
			isMediaGroup ? phrases.tags_updated_plural : phrases.tags_updated_single, {
			reply_to_message_id: replyToMessageId,
			reply_markup: {
				inline_keyboard: [
					[{
						text: isFileDeleted ?
							isMediaGroup ? phrases.button_recover_plural : phrases.button_recover_single
							:
							isMediaGroup ? phrases.button_delete_plural : phrases.button_delete_single,
						callback_data: [
							isFileDeleted ?
								isMediaGroup ? "recover_media_group" : "recover"
								:
								isMediaGroup ? "delete_media_group" : "delete",
							isMediaGroup ? file.media_group_id : replyToMessageId,
						].join(",")
					}],
					inlineShareButton,
				]
			}
		})
	}
	else if (isForwarded) {
		return ctx.reply(phrases.error_no_file)
	}
	else {
		return ctx.reply(phrases.error_message_without_context)
	}
})

bot.on("edited_message", async ctx => {
	log("Edited message")
	const message = ctx.update.edited_message
	const chatId = ctx.chat.id
	const messageId = message.message_id
	const fileMessageId = message.reply_to_message ? message.reply_to_message.message_id : message.message_id
	const newTags = message.caption || message.text || false

	const fileExist = await isFileExist({
		chat_id: chatId,
		message_id: fileMessageId,
	});

	if (!fileExist) {
		return ctx.reply(phrases.error_edit_file_not_found)
	}
	if (!newTags) {
		return ctx.reply(phrases.error_edit_tags_not_specified)
	}
	
	const file = await getFile({
		chat_id: chatId,
		message_id: fileMessageId,
	})
	const isFileDeleted = file.is_deleted === 1
	const mediaGroupId = file.media_group_id
	const isMediaGroup = mediaGroupId !== ""

	if (isMediaGroup) {
		await updateMediaGroupTags({
			tags: newTags,
			chat_id: chatId,
			media_group_id: mediaGroupId,
		})
	}
	else {
		await updateFileTags({
			tags: newTags,
			chat_id: chatId,
			file_message_id: fileMessageId,
		})
	}

	return ctx.replyWithMarkdown(
		isMediaGroup ? phrases.tags_updated_plural : phrases.tags_updated_single, {
		reply_to_message_id: file.file_message_id,
		reply_markup: {
			inline_keyboard: [
				[{
					text: isFileDeleted ?
						isMediaGroup ? phrases.button_recover_plural : phrases.button_recover_single
						:
						isMediaGroup ? phrases.button_delete_plural : phrases.button_delete_single,
					callback_data: [
						isFileDeleted ?
							isMediaGroup ? "recover_media_group" : "recover"
							:
							isMediaGroup ? "delete_media_group" : "delete",
						isMediaGroup ? file.media_group_id : file.file_message_id,
					].join(",")
				}],
				inlineShareButton,
			]
		}
	})
})

bot.on("callback_query", async ctx => {
	log("Button pressed")
	const callbackQuery = ctx.update.callback_query
	const messageId = callbackQuery.message.message_id
	const chatId = callbackQuery.from.id
	const data = callbackQuery.data.split(",")
	const command = data[0]

	ctx.answerCbQuery()

	if (command === "delete") {
		const fileMessageId = Number(data[1])
		setFileDeletedState({
			is_deleted: 1,
			chat_id: chatId,
			file_message_id: fileMessageId,
		})
		return telegram.editMessageText(
			chatId,
			messageId,
			null,
			phrases.deleted_single,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: phrases.button_recover_single,
							callback_data: ["recover", fileMessageId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
	else if (command === "recover") {
		const fileMessageId = Number(data[1])
		setFileDeletedState({
			is_deleted: 0,
			chat_id: chatId,
			file_message_id: fileMessageId,
		})
		return telegram.editMessageText(
			chatId,
			messageId,
			null,
			phrases.recovered_single,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: phrases.button_delete_single,
							callback_data: ["delete", fileMessageId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
	else if (command === "delete_media_group") {
		const mediaGroupId = data[1]
		setMediaGroupDeletedState({
			is_deleted: 1,
			chat_id: chatId,
			media_group_id: mediaGroupId,
		})
		return telegram.editMessageText(
			chatId,
			messageId,
			null,
			phrases.deleted_plural,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: phrases.button_recover_plural,
							callback_data: ["recover_media_group", mediaGroupId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
	else if (command === "recover_media_group") {
		const mediaGroupId = data[1]
		setMediaGroupDeletedState({
			is_deleted: 0,
			chat_id: chatId,
			media_group_id: mediaGroupId,
		})
		return telegram.editMessageText(
			chatId,
			messageId,
			null,
			phrases.recovered_plural,
			{
				reply_markup: {
					inline_keyboard: [
						[{
							text: phrases.button_delete_plural,
							callback_data: ["delete_media_group", mediaGroupId].join(",")
						}],
						inlineShareButton,
					]
				},
				parse_mode: "Markdown",
			}
		)
	}
})

bot.on("inline_query", async ctx => {
	const inlineQuery = ctx.update.inline_query
	const chatId = inlineQuery.from.id
	let query = inlineQuery.query.trim()
	const page = inlineQuery.offset ? Number(inlineQuery.offset) : 0
	const currentPageLimitOffset = [page * 50, page * 50 + 50]
	const nextPageLimitOffset = [(page + 1) * 50, (page + 1) * 50 + 50]

	const ownCaptionMatch = query.match(/\.\.(.+)$/)
	const ownCaption = ownCaptionMatch ? ownCaptionMatch[1] : false
	ownCaptionMatch ? (query = removeSubstr(query, ownCaptionMatch.index, ownCaptionMatch[0].length)) : (query = query.replace(/\.\.$/, ""))

	const filterTypeMatch = query.match(/^(video|gif|photo)\s?/)
	const filterType = filterTypeMatch ? filterTypeMatch[1] : false
	filterTypeMatch && (query = removeSubstr(query, filterTypeMatch.index, filterTypeMatch[0].length))

	query = query.toLowerCase().trim()

	log(`Inline query: ${query}`)
	
	if (/^,+$/.test(query)) {
		return ctx.answerInlineQuery([], {
			cache_time: 2,
			switch_pm_text: "Введите больше символов",
			switch_pm_parameter: "start",
			is_personal: true,
		})
	}
	else if (query.length === 0) {
		const usersFiles = filterType ?
			await getUserFilesOfType({
				chat_id: chatId,
				type: filterType,
			})
			:
			await getUserFiles({
				chat_id: chatId,
			})
		if (usersFiles.length > 0) {
			const results = usersFiles
				.slice(...currentPageLimitOffset)
				.map(file => {
					const result = {
						type: file.type,
						id: file.id,
						[typeParamsMap[file.type]]: file.file_id,
					}
					ownCaption && (result.caption = ownCaption)
					file.type === "video" && (result.title = "Video")
					return result
				})
			return ctx.answerInlineQuery(results, {
				cache_time: 2,
				next_offset: usersFiles.slice(...nextPageLimitOffset).length > 0 ? page + 1 : "",
				is_personal: true,
			})
		}
		else {
			return ctx.answerInlineQuery([], {
				cache_time: 2,
				switch_pm_text: phrases.you_have_no_pictures,
				switch_pm_parameter: "start",
				next_offset: "",
				is_personal: true,
			})
		}
	}
	else {
		const usersFiles = filterType ?
			await getUserFilesOfType({
				chat_id: chatId,
				type: filterType,
			})
			:
			await getUserFiles({
				chat_id: chatId,
			})
		if (usersFiles.length === 0) {
			return ctx.answerInlineQuery([], {
				cache_time: 2,
				switch_pm_text: phrases.you_have_no_pictures,
				switch_pm_parameter: "start",
				next_offset: "",
				is_personal: true,
			})
		}
		const results = []
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
		const results_ = results
			.slice(...currentPageLimitOffset)
			.map(file => {
				let result = {
					type: file.type,
					id: file.id,
					[typeParamsMap[file.type]]: file.file_id,
				}
				ownCaption && (result.caption = ownCaption)
				file.type === "video" && (result.title = "Video")
				return result
			})
		const body = {
			cache_time: 2,
			next_offset: results.slice(...nextPageLimitOffset).length > 0 ? page + 1 : "",
			is_personal: true,
		}
		if (results_.length === 0 && page === 0) {
			body.switch_pm_text = phrases.nothing_found
			body.switch_pm_parameter = "start"
		}
		ctx.answerInlineQuery(results_, body)
	}
})

bot.on("chosen_inline_result", async ctx => {
	log("Chosen inline result")
	const fileId = Number(ctx.update.chosen_inline_result.result_id)
	const chatId = ctx.from.id
	increaseUsedCount({
		chat_id: chatId,
		id: fileId,
	})
})

bot.launch()

/*start - 😎 Начать
hints - 💡 Советы
donate - 💸 Задонатить*/