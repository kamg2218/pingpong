const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

let imagedata;

const secret = speakeasy.generateSecret({
    length: 20,
    name: 'hyunji Yoon',
    issuer: 'kamg2218@gmail.com'
});
const url = speakeasy.otpauthURL({
    secret: secret.ascii,
    issuer: 'OTP TEST',
    label: 'kamg2218@gmail.com',
    algorithm: 'SHA1',
    period: 30
});

function makeCode(setData){
    console.log('qrcode is starting...');

    QRCode.toDataURL(url, async (err, imageData)=>{
            // const image = document.querySelector(img);
            // if (image){
            //     image.src = imageData;
            //     // image.innerText = imageData;
            // }
        imagedata = imageData;
        // console.log('img data: ', imagedata);
        setData(imagedata, url, secret.base32);
        // await setData(imagedata).then(console.log('finished!'));
            // console.log('url: ', url);
            // console.log('secret: ', secret.base32);
        //});
        // return imagedata;
    });
    return imagedata;
}

function verifiedCode(data, setVerified){
    let verified = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        algorithm: 'SHA1',
        token: data.token,
    });

    console.log('verified = ' + verified);
    // data.setVerified(verified);
    setVerified(verified);
}

module.exports = { makeCode, verifiedCode };