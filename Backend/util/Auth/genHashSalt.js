// Usage: node genHashSalt.js word
// Output: word, hash, salt

const crypto = require('crypto');

function genHashSalt(word) {
    let salt = crypto.randomBytes(32).toString('hex');
    let hash = crypto.pbkdf2Sync(word, salt, 10000, 64, 'sha512').toString('hex');
    console.log("input word: " + word);
	console.log("hash: " + hash);
	console.log("salt: " + salt);
}

genHashSalt(process.argv[2]);