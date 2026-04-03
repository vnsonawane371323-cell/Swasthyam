const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude accidental nested repo copy to avoid duplicate module/package resolution.
config.resolver.blockList = [
	/.*[\\/]swasthtel-app[\\/]swasthtel-app[\\/].*/,
];

module.exports = config;
