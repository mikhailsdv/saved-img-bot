const trimMessage = str => str.replace(/\t+/gm, "")

const zeroFirst = s => {
	return `0${s}`.substr(-2)
}

const arrEnd = arr => arr.length === 0 ? null : arr[arr.length - 1]

const getDateString = () => {
	let d = new Date()
	return `${zeroFirst(d.getDate())}.${zeroFirst(d.getMonth() + 1)}.${d.getFullYear()} ${zeroFirst(d.getHours())}:${zeroFirst(d.getMinutes())}:${zeroFirst(d.getSeconds())}`
}

const removeSubstr = (str, from, length) => `${str.substr(0, from)}${str.substr(from + length)}`

const log = (...args) => console.log(`${getDateString()}:`, ...args)

const getTranslitVariants = str => {
	const strSplit = str.split("")
	let variants = []
	const alphabets = [
		[
			"qwertyuiop[]asdfghjkl;'zxcvbnm,.",
			"йцукенгшщзхъфывапролджэячсмитьбю",
		],
		[
			"йцукенгшщзфывапролдячсмить",
			"qwertyuiopasdfghjklzxcvbnm",
		],
	]
	variants.push(str)
	alphabets.forEach(alphabet => {
		const from = alphabet[0].split("")
		const to = alphabet[1].split("")

		let result = ""

		strSplit.forEach(letter => {
			const letterIndex = from.findIndex(fromLetter => fromLetter === letter)
			if (letterIndex > -1) {
				result += to[letterIndex]
			}
			else {
				result += letter
			}
		})

		if (result !== str) {
			variants.push(result)
		}
	})

	return variants
}

module.exports = {
	trimMessage,
	zeroFirst,
	getDateString,
	removeSubstr,
	getTranslitVariants,
	arrEnd,
	log,
}