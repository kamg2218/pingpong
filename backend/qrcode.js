const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

let imagedata;

const secret = speakeasy.generateSecret({
    length: 20,
    name: 'hyunji Yoon',
    issuer: 'kamg2218@gmail.com'
});
// const url = speakeasy.otpauthURL({
//     secret: secret.ascii,
//     issuer: 'OTP TEST',
//     label: 'kamg2218@gmail.com',
//     // algorithm: 'SHA512',
//     period: 30
// });

function makeCode(setData){
    console.log('qrcode is starting...');
    QRCode.toDataURL(secret.otpauth_url, async (err, imageData)=>{
        imagedata = imageData;
        setData(imagedata, secret.otpauth_url, secret.base32);
    });
    console.log(`secret.base32 = ${secret.base32}`);
    return imagedata;
}

function verifiedCode(data, done){
    let verified = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token: data.token,
    });
    console.log(`token = ${data.token}`);
    console.log(`secret.base32 = ${secret.base32}`);
    console.log('verified = ' + verified);
    done(verified);
}

module.exports = { makeCode, verifiedCode };