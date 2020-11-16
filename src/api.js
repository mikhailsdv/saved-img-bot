const mysql = require("mysql2")
const {getDateString} = require("./functions")
const log = require("./log")

const DB = mysql.createPool({
	host: "localhost",
	user: "root",
	database: "saved_img_bot"
})

const insert = ({table, columns}) => {
	return new Promise((resolve, reject) => {
		DB.query(
			`INSERT INTO \`${table}\` SET ${Object.keys(columns).map(item => `\`${item}\` = ?`).join(", ")}`,
			Object.values(columns),
			(error, results, fields) => {
				if (error) {
					log.red(getDateString(), "Insert error:", {
						table: table,
						columns: columns,
						error: error,
					})
					reject(error)
				}
				else {
					log.green(getDateString(), "Insert:", {
						table: table,
						columns: columns,
						results: results,
					})
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
}

const has = ({table, where}) => {
	return new Promise((resolve, reject) => {
		const keys = Object.keys(where)
		DB.query(
			`SELECT ${keys.join(", ")} FROM \`${table}\` WHERE ${keys.map(item => `\`${item}\` = ?`).join(" AND ")}`,
			Object.values(where),
			(error, results, fields) => {
				if (error) {
					log.red(getDateString(), "Has error:", {
						table: table,
						where: where,
						error: error,
					})
					reject(error)
				}
				else {
					log.green(getDateString(), "Has:", {
						table: table,
						where: where,
						results: results,
					})
					resolve(results.length > 0)
				}
			}
		)
	})
}

const select = ({table, columns, where, order}) => {
	return new Promise((resolve, reject) => {
		let query = `SELECT ${columns.join(", ")} FROM \`${table}\``
		
		if (where) {
			query += ` WHERE ${Object.keys(where).map(item => `\`${item}\` = ?`).join(" AND ")}`
		}
		if (order) {
			let column = Object.keys(order)[0]
			query += ` ORDER BY \`${column}\` ${order[column].toUpperCase()}`
		}
		log.def(query)
		DB.query(
			query,
			where ? Object.values(where) : null,
			(error, results, fields) => {
				if (error) {
					log.red(getDateString(), "Select error:", {
						table: table,
						columns: columns,
						where: where,
						order: order,
						error: error,
					})
					reject(error)
				}
				else {
					log.green(getDateString(), "Select:", {
						table: table,
						columns: columns,
						where: where,
						order: order,
						results: results,
					})
					resolve(results)
				}
			}
		)
	})
}

const update = ({table, columns, where}) => {
	return new Promise((resolve, reject) => {
		DB.query(
			`UPDATE \`${table}\` SET ${Object.entries(columns).map(item => `\`${item[0]}\` = ?`).join(", ")} WHERE ${Object.keys(where).map(item => `\`${item}\` = ?`).join(" AND ")}`,
			Object.values(columns).concat(Object.values(where)),
			(error, results, fields) => {
				if (error) {
					log.red(getDateString(), "Update eror:", {
						table: table,
						columns: columns,
						where: where,
						error: error,
					})
					reject(error)
				}
				else {
					log.green(getDateString(), "Update:", {
						table: table,
						columns: columns,
						where: where,
						results: results,
					})
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
}

module.exports = {
	select: select,
	insert: insert,
	has: has,
	update: update,
}