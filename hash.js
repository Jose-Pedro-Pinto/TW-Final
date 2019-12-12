module.exports.encript = encript;
const crypto = require('crypto');
function encript(data){
	let value = "";
	for (attribute in data){
		value+=JSON.stringify(data[attribute]);
	}
	const hash = crypto
	   .createHash('md5')
	   .update(value)
	   .digest('hex');
	return hash;
}