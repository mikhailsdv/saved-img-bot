module.exports = {
	trimMessage: str => str.replace(/\t+/gm, ""),
	getDateString: () => {
		const zeroFirst = s => {
			return `0${s}`.substr(-2)
		}
		let d = new Date()
		return `${zeroFirst(d.getDate())}.${zeroFirst(d.getMonth() + 1)}.${d.getFullYear()} ${zeroFirst(d.getHours())}.${zeroFirst(d.getMinutes())}.${zeroFirst(d.getSeconds())}`
	},
	randInt: () => Math.round(Math.random() * 1000000),
	removeSubstr: (str, from, length) => `${str.substr(0, from)}${str.substr(from + length)}`,
	getTranslitVariants: str => {
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
}