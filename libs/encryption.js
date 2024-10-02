const crypto = require('crypto');
const { discordToken, discordClientId } = require('../libs/config.js');

const algorithm = 'aes-256-ctr';

const key = crypto
  .createHash('sha512')
  .update(discordToken)
  .digest('hex')
  .substring(0, 32)

function encryptData(data) {
    if (data == null) {
        return;
    }

    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv(algorithm, key, iv);
    var encrypted = cipher.update(toString(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptData(data) {
   console.log(data);
    var dataParts = data.split(':');
    var iv = Buffer.from(dataParts.shift(), 'hex');
    var encryptedData = Buffer.from(dataParts.join(':'), 'hex');
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    var decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]).toString();

    console.log(decrypted);

    return decrypted;
}

module.exports = {
    encryptData,
    decryptData
}