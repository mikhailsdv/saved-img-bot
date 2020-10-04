module.exports = {
	trimMessage: str => str.replace(/\t+/gm, ""),
	getDateString: () => {
		const zeroFirst = s => {
			return `0${s}`.substr(-2)
		}
		let d = new Date()
		return `${zeroFirst(d.getDate())}.${zeroFirst(d.getMonth() + 1)}.${d.getFullYear()} ${zeroFirst(d.getHours())}.${zeroFirst(d.getMinutes())}.${zeroFirst(d.getSeconds())}`
	},
	randInt: () => Math.round(Math.random() * 1000000)
}