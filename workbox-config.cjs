module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{css,js,woff2,woff,png,html}'
	],
	swDest: 'public/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};