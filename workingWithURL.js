let mysql = require('mysql');
const fetch = require('node-fetch');


let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'textanalisator'
});
function gettingUrls() {
    let urls = [];
    let promise = new Promise(function (resolve, reject) {


        connection.connect(function (err) {
            if (err) throw err;
            let sql = `SELECT text_url FROM textanalisator.text_description`;
            connection.query(sql, function (err, result) {
                if (err) reject(err);
                for (let u = 0; u < result.length; u++) {
                    urls.push(result[u].text_url);
                }
                resolve(urls);

            });
        });

    });
    // for (let i = 0; i < 1; i++) {
    //     let res = await fetch(urls[i]);
    //     analyseText(await res.text(), object);

    //     let wAmount = "'"+JSON.stringify(consoleLogingResult(object))+"'";
    //     console.log(wAmount);

    // }
    return promise;
}
gettingUrls()
    .then(async function (urls) {
        try {
            let resultSQL = [];
            for (let i = 0; i < urls.length; i++) {
                let url = '"' + urls[i] + '"';
                let text = await fetch(urls[i]);
                let object = {};                
                analyseText(await text.text(), object);
                let wAmount = "'" + JSON.stringify(consoleLogingResult(object)) + "'";
                resultSQL.push('(' + url + ',' + wAmount + ')');
            }
            let sql = `INSERT INTO urls_and_results (text_url, words_amount) VALUES ${resultSQL}`;
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        } catch (e) {
            console.error('error while analysing:' + e);
        }
    })
    .catch(console.error);


function analyseText(body, object) {
    let inputValue = '';
    inputValue = body
        .replace(/[^a-zA-Z ]/g, ' ')
        .toLowerCase()
        .replace(/\s\s+/g, ' ')
        .split(' ');

    for (let i = 0; i < inputValue.length; i++) {
        let word = inputValue[i].toString();

        if (object[word]) {
            object[word]++;
        } else {
            object[word] = 1;
        }

    }

    if (object['']) {
        delete object[''];
    }

    return object;
}

function consoleLogingResult(object) {
    let array1 = [];
    let newObject = {};

    Object.keys(object).forEach(key => { array1.push({ word: key, amount: object[key] }); });

    function compareAmount(wordA, wordB) {
        return wordA.amount - wordB.amount;
    }

    array1.sort(compareAmount).reverse();

    for (let i = 1; i <= 10; i++) {
        newObject[array1[i - 1].word] = array1[i - 1].amount;
    }

    return newObject;
}