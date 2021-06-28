const mysql = require("mysql2")
const config = require("./config")

const DB = mysql.createPool({
	host: config.MYSQL_HOST,
	user: config.MYSQL_USER,
	database: config.MYSQL_DATABASE
})


const saveFile = ({
	chat_id,
	type,
	file_size,
	file_id,
	file_unique_id,
	height,
	width,
	tags = "",
	file_message_id,
	tags_message_id,
	media_group_id = "",
}) => new Promise((resolve, reject) => {
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
			height,
			width,
			tags,
			file_message_id,
			tags_message_id,
			media_group_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
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
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			INSERT INTO \`${config.USERS_TABLE_NAME}\`
			SET 
				\`chat_id\` = ?,
				\`username\` = ?,
				\`first_name\` = ?,
				\`language_code\` = ?
		`,
		[
			chat_id,
			username,
			first_name,
			language_code,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})

const isFileExist = ({
	chat_id,
	message_id,
}) => new Promise((resolve, reject) => {
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
		[
			chat_id,
			message_id,
			message_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(results.length > 0)
			}
		}
	)
})

const isUserExist = ({
	chat_id,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			SELECT \`chat_id\`
			FROM \`${config.USERS_TABLE_NAME}\`
			WHERE
				\`chat_id\` = ?
		`,
		[
			chat_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(results.length > 0)
			}
		}
	)
})

const getFile = ({
	chat_id,
	message_id,
}) => new Promise((resolve, reject) => {
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
				(\`file_message_id\` = ? OR \`tags_message_id\` = ?)
		`,
		[
			chat_id,
			message_id,
			message_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(results[0])
			}
		}
	)
})

const getUserFiles = ({
	chat_id,
}) => new Promise((resolve, reject) => {
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
				\`is_deleted\` = 0
			ORDER BY \`date\` DESC
		`,
		[
			chat_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(results)
			}
		}
	)
})

const getUserFilesOfType = ({
	chat_id,
	type,
}) => new Promise((resolve, reject) => {
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
				\`type\` = ? AND
				\`is_deleted\` = 0
			ORDER BY \`date\` DESC
		`,
		[
			chat_id,
			type,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				resolve(results)
			}
		}
	)
})

const updateFileTags = ({
	chat_id,
	file_message_id,
	tags,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`tags\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`file_message_id\` = ?
		`,
		[
			tags,
			chat_id,
			file_message_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})

const updateMediaGroupTags = ({
	chat_id,
	media_group_id,
	tags,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`tags\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`media_group_id\` = ?
		`,
		[
			tags,
			chat_id,
			media_group_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})

const setFileDeletedState = ({
	is_deleted,
	chat_id,
	file_message_id,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`is_deleted\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`file_message_id\` = ?
		`,
		[
			is_deleted,
			chat_id,
			file_message_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})

const setMediaGroupDeletedState = ({
	is_deleted,
	chat_id,
	media_group_id,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`is_deleted\` = ?
			WHERE
				\`chat_id\` = ? AND
				\`media_group_id\` = ?
		`,
		[
			is_deleted,
			chat_id,
			media_group_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})

const increaseUsedCount = ({
	id,
	chat_id,
}) => new Promise((resolve, reject) => {
	DB.query(
		`
			UPDATE \`${config.FILES_TABLE_NAME}\`
			SET
				\`used_count\` = \`used_count\` + 1
			WHERE
				\`id\` = ? AND
				\`chat_id\` = ?
		`,
		[
			id,
			chat_id,
		],
		(error, results, fields) => {
			if (error) {
				reject(error)
			}
			else {
				if (results.affectedRows > 0) {
					resolve(true)
				}
				else {
					resolve(false)
				}
			}
		}
	)
})


module.exports = {
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
}