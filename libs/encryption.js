const crypto = require('crypto');

const algorithm = 'aes-256-gcm';

function encryptData(data) {
    if (data == null) {
        return;
    }

    var key = crypto.randomBytes(32).toString('base64');
    var iv = crypto.randomBytes(16).toString('base64');
    var cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
    var encrypted = cipher.update(data.toString(), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag().toString('base64');

    return key + ':' + iv + ':' + encrypted + ':' + tag;
}

function decryptData(data) {
    var dataParts = data.split(':');
    var key = Buffer.from(dataParts[0], 'base64');
    var iv = Buffer.from(dataParts[1], 'base64');
    var encryptedData = dataParts[2];
    var tag = Buffer.from(dataParts[3], 'base64')

    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    var decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = {
    encryptData,
    decryptData
}