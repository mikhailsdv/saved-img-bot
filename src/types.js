const {arrEnd} = require("./utils")

module.exports = {
	gif: {
		inlineResultKey: "gif_file_id",
		sendCtxMethod: "replyWithAnimation",
		extractMediaItem: message => message.animation || message.document,
		extractTitle: message => message?.animation?.file_name || message?.document?.file_name,
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: false,
	},
	photo: {
		inlineResultKey: "photo_file_id",
		sendCtxMethod: "replyWithPhoto",
		extractMediaItem: message => arrEnd(message.photo),
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: false,
	},
	video: {
		inlineResultKey: "video_file_id",
		sendCtxMethod: "replyWithVideo",
		extractMediaItem: message => message.video,
		extractTitle: message => message.video.file_name,
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: true,
	},
	sticker: {
		inlineResultKey: "sticker_file_id",
		sendCtxMethod: "replyWithSticker",
		extractMediaItem: message => message.sticker,
		isPremium: true,
		canHaveCaption: false,
		mustHaveTitle: false,
	},
	voice: {
		inlineResultKey: "voice_file_id",
		sendCtxMethod: "replyWithVoice",
		extractMediaItem: message => message.voice,
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: true,
	},
	video_note: {
		inlineResultKey: "video_file_id",
		sendCtxMethod: "replyWithVideo",
		extractMediaItem: message => message.video_note,
		isPremium: true,
		canHaveCaption: false,
		mustHaveTitle: true,
	},
	audio: {
		inlineResultKey: "audio_file_id",
		sendCtxMethod: "replyWithAudio",
		extractMediaItem: message => message.audio,
		extractTitle: message => {
			const {
				audio: {performer, title, file_name},
			} = message
			if (performer || title) {
				return [title, performer].filter(Boolean).join(" — ")
			} else if (file_name) {
				return file_name
			}
		},
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: false,
	},
	document: {
		inlineResultKey: "document_file_id",
		sendCtxMethod: "replyWithDocument",
		extractMediaItem: message => message.document,
		extractTitle: message => message.document.file_name,
		isPremium: false,
		canHaveCaption: true,
		mustHaveTitle: true,
	},
}
