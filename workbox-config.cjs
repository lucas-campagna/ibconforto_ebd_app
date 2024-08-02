module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{css,js,woff2,woff,png,html}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};