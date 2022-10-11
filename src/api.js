const mysql = require("mysql2")
const config = require("./config")

const DB = mysql.createPool({
	host: config.MYSQL_HOST,
	user: config.MYSQL_USER,
	database: config.MYSQL_DATABASE,
})

const saveFile = ({
	chat_id,
	type,
	file_size,
	file_id,
	file_unique_id,
	height = 0,
	width = 0,
	tags = "",
	title = "",
	file_message_id,
	tags_message_id,
	media_group_id = "",
}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			INSERT INTO \`${config.FILES_TABLE_NAME}\`
			SET 
				\`chat_id\` = ?,
				\`type\` = ?,
				\`file_size\` = ?,
				\`file_id\` = ?,
				\`file_unique_id\` = ?,
				\`height\` = ?,
				\`width\` = ?,
				\`tags\` = ?,
				\`title\` = ?,
				\`file_message_id\` = ?,
				\`tags_message_id\` = ?,
				\`media_group_id\` = ?,
				\`used_count\` = 0,
				\`is_deleted\` = 0
		`,
			[
				chat_id,
				type,
				file_size,
				file_id,
				file_unique_id,
				height || 0,
				width || 0,
				tags,
				title,
				file_message_id,
				tags_message_id,
				media_group_id,
			],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const createUser = ({
	chat_id,
	username = "",
	first_name,
	language_code = "",
	is_premium = 0,
}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			INSERT INTO \`${config.USERS_TABLE_NAME}\`
			SET 
				\`chat_id\` = ?,
				\`username\` = ?,
				\`first_name\` = ?,
				\`language_code\` = ?,
				\`is_premium\` = ?
		`,
			[chat_id, username, first_name, language_code, is_premium],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const revokePremium = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.USERS_TABLE_NAME}\`
			SET 
				\`is_premium\` = 0
			WHERE \`chat_id\` = ?
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const setPremium = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.USERS_TABLE_NAME}\`
			SET 
				\`is_premium\` = 1
			WHERE \`chat_id\` = ?
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const moveFiles = ({from_chat_id, to_chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET 
				\`chat_id\` = ?
			WHERE \`chat_id\` = ?
		`,
			[to_chat_id, from_chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const isFileExist = ({chat_id, message_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				\`chat_id\`,
				\`file_message_id\`
			FROM \`${config.FILES_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				(\`file_message_id\` = ? OR \`tags_message_id\` = ?)
		`,
			[chat_id, message_id, message_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results.length > 0)
				}
			}
		)
	})

const isUserExist = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT \`chat_id\`
			FROM \`${config.USERS_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ?
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results.length > 0)
				}
			}
		)
	})

const getUser = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT *
			FROM \`${config.USERS_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ?
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results[0])
				}
			}
		)
	})

const isPremiumUser = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT \`chat_id\`
			FROM \`${config.USERS_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				\`is_premium\` = 1
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results.length > 0)
				}
			}
		)
	})

const getFile = ({chat_id, message_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				\`id\`,
				\`type\`,
				\`chat_id\`,
				\`file_id\`,
				\`tags\`,
				\`title\`,
				\`file_message_id\`,
				\`used_count\`,
				\`is_deleted\`,
				\`media_group_id\`
			FROM \`${config.FILES_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				(\`file_message_id\` = ? OR \`tags_message_id\` = ?)
		`,
			[chat_id, message_id, message_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results[0])
				}
			}
		)
	})

const getUserFiles = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				\`id\`,
				IF(\`type\` = "video_note", "video", \`type\`) AS \`type\`,
				\`chat_id\`,
				\`file_id\`,
				\`tags\`,
				\`title\`,
				\`file_message_id\`,
				\`used_count\`,
				\`is_deleted\`,
				\`media_group_id\`,
				\`date\`
			FROM \`${config.FILES_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				\`is_deleted\` = 0
			ORDER BY \`date\` DESC
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results)
				}
			}
		)
	})

/*const getUserFilesForExport = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				\`id\`,
				\`type\`,
				\`chat_id\`,
				\`file_id\`,
				\`tags\`,
				\`file_message_id\`,
				\`used_count\`,
				\`is_deleted\`,
				\`media_group_id\`
			FROM \`${config.FILES_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				\`is_deleted\` = 0 AND
				\`file_size\` < 20971520
			ORDER BY \`date\` DESC
		`,
			[chat_id],
			(error, results, fields) => {
				if (error) {
					reject(error)
				} else {
					resolve(results)
				}
			}
		)
	})*/

const getUserFilesOfType = ({chat_id, type}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				\`id\`,
				IF(\`type\` = "video_note", "video", \`type\`) AS \`type\`,
				\`chat_id\`,
				\`file_id\`,
				\`tags\`,
				\`title\`,
				\`file_message_id\`,
				\`used_count\`,
				\`is_deleted\`,
				\`media_group_id\`,
				\`date\`
			FROM \`${config.FILES_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ? AND
				\`type\` = ? AND
				\`is_deleted\` = 0
			ORDER BY \`date\` DESC
		`,
			[chat_id, type],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results)
				}
			}
		)
	})

const updateFileTags = ({chat_id, file_message_id, tags}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`tags\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`file_message_id\` = ?
		`,
			[tags, chat_id, file_message_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const deleteAllUsersFiles = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`is_deleted\` = 1
			WHERE
				\`chat_id\` = ?
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const updateMediaGroupTags = ({chat_id, media_group_id, tags}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`tags\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`media_group_id\` = ?
		`,
			[tags, chat_id, media_group_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const setFileDeletedState = ({is_deleted, chat_id, file_message_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`is_deleted\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`file_message_id\` = ?
		`,
			[is_deleted, chat_id, file_message_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const setMediaGroupDeletedState = ({is_deleted, chat_id, media_group_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`is_deleted\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`media_group_id\` = ?
		`,
			[is_deleted, chat_id, media_group_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const increaseUsedCount = ({id, chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`used_count\` = \`used_count\` + 1
			WHERE
				\`id\` = ? AND
				\`chat_id\` = ?
		`,
			[id, chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					if (results.affectedRows > 0) {
						resolve(true)
					} else {
						resolve(false)
					}
				}
			}
		)
	})

const getStatistics = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ?) as \`count\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "photo") as \`photos\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "video") as \`videos\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "video_note") as \`video_notes\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "document") as \`documents\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "audio") as \`audios\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "voice") as \`voices\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "sticker") as \`stickers\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`type\` = "gif") as \`gifs\`,
				(SELECT COUNT(*) FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? AND \`tags\` != "") as \`has_tags\`
		`,
			Array(10).fill(chat_id),
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results[0])
				}
			}
		)
	})

const getMostUsedFile = ({chat_id}) =>
	new Promise((resolve, reject) => {
		DB.query(
			`
			SELECT \`file_id\`, \`type\`, \`used_count\` FROM \`${config.FILES_TABLE_NAME}\` WHERE \`chat_id\` = ? ORDER BY \`used_count\` DESC LIMIT 1
		`,
			[chat_id],
			(error, results /*, fields*/) => {
				if (error) {
					reject(error)
				} else {
					resolve(results)
				}
			}
		)
	})

module.exports = {
	saveFile,
	createUser,
	isFileExist,
	isUserExist,
	isPremiumUser,
	getFile,
	getUserFiles,
	getUserFilesOfType,
	updateFileTags,
	updateMediaGroupTags,
	setFileDeletedState,
	setMediaGroupDeletedState,
	increaseUsedCount,
	getStatistics,
	getMostUsedFile,
	getUser,
	revokePremium,
	moveFiles,
	setPremium,
	deleteAllUsersFiles,
	//getUserFilesForExport,
}
