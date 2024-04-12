module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{json,css,js,woff2,woff,png,html}',
	],
	swDest: 'dist/sw.js',
	runtimeCaching:[
		{urlPattern: '/login', handler: "CacheFirst"},
		{urlPattern: '/configuration', handler: "CacheFirst"},
		{urlPattern: '/?date=.+', handler: "CacheFirst"},
		{
			urlPattern: /.*\.(json|css|js|woff2|woff|png|html)/,
  			handler: "CacheFirst",
		},
	],
	ignoreURLParametersMatching: []
};