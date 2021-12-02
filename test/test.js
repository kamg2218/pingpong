const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const secret = speakeasy.generateSecret({
    length: 20,
    name: 'hyunji Yoon',
    issuer: 'kamg2218@gmail.com'
});

var url = speakeasy.otpauthURL({
    secret: secret.ascii,
    issuer: 'OTP TEST',
    label: 'kamg2218@gmail.com',
    algorithm: '1234',
    period: 30
});

QRCode.toDataURL(url, async (err, imageData)=>{
    const image = document.querySelector(img);
    if (image){
        image.src = imageData;
        image.innerText = imageData;
    }

    console.log('img data: ', imageData);
    console.log('url: ', url);
    console.log('secret: ', secret.base32);
});