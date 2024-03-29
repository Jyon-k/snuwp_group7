
var http = require('http');
var localStorage = require('localStorage')

http.createServer(function (req, res) {
    var jsonData = {};
    var chunkString = "";
    req.on('data', function (chunk) {
        chunkString += chunk;
        const splittedStringChunks = chunkString.split('&');
        splittedStringChunks.forEach((splittedStringChunk) => { jsonData[splittedStringChunk.split('=')[0]] = splittedStringChunk.split('=')[1] })
        //jsonData = JSON.stringify(jsonChunk);
    })
    req.on('end', function () {
        var reqObj = jsonData;
        if (reqObj.id !== undefined) {
            console.log("log");
            getLogin(reqObj.id, reqObj.psw)
                .then((resObj) => {
                    res.writeHead(200);
                    res.end(JSON.stringify(resObj));
                });
        }
        else if (reqObj.cb !== undefined) {
            console.log("reg");
            registerClass(reqObj.cb, reqObj.ocr)
                .then((resObj) => {
                    res.writeHead(200);
                    console.log(resObj);
                    res.end(JSON.stringify(resObj));
                });
        }
        else {
            console.log("img");
            saveImgToLocal();
        }
    })
}).listen(3001, 'localhost')
console.log('Server running at http://127.0.0.1:3001/');


const getLogin = (id, psw) => {
    return new Promise((resolve) => {
        var request = require('request');
        request.post({
            url: 'http://sugang.snu.ac.kr/sugang/j_login',
            form: {
                "j_password": psw,
                "j_username": id,
                "t_password": psw,
                "v_password": psw
            }
        }, function (err, res) {
            var cookie = res.headers["set-cookie"]
            localStorage.removeItem('__cookie');
            localStorage.setItem('__cookie', cookie);
            console.log(localStorage.getItem('__cookie'));
            request.get({
                url: 'http://sugang.snu.ac.kr/sugang/cc/cc210.action',
                headers: {
                    'Cookie': localStorage.getItem('__cookie')
                }
            }, function (err, res) {
                console.log(res.headers['Set-Cookie'])
                resolve(res.toJSON());
            })
        })
    });
}

const registerClass = (checkBoxNumber, ocrNumber) => {
    return new Promise((resolve) => {
        var request = require('request');
        request.post({
            url: 'http://sugang.snu.ac.kr/sugang/ca/ca101.action',
            headers: {
                'Cookie': localStorage.getItem('__cookie')
            },
            form: {
                "check": checkBoxNumber,
                "inputText": ocrNumber,
                "workType": "I"
            }
        }, function (err, res) {
            resolve(res.toJSON());
        })
    });
}

const saveImgToLocal = () => {
    const download = require('image-downloader')

    // Download to a directory and save with the original filename
    const options = {
        url: 'http://sugang.snu.ac.kr/sugang/ca/number.action?v=0.28415202633175474',
        dest: './number.jpg'                // Save to /path/to/dest/image.jpg
    }

    download.image(options)
        .then(({ filename, image }) => {
            console.log('Saved to', filename)  // Saved to /path/to/dest/image.jpg
        })
        .catch((err) => console.error(err));
}

