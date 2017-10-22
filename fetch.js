const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const http = require('http');
const file = fs.createWriteStream('file.txt');
let request = require('request');
let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'textanalisator'
});

fetch('http://www.textfiles.com/etext/FICTION/')
    .then(function (response) {
        return response.text();
    })
    .then(async function (html) {
        const $ = cheerio.load(html);
        let a = $('a');
        let object = {};
        let resultSQL =[];
        for (let i = 0; i < a.length; i++) {
            let res = await fetch('http://www.textfiles.com/etext/FICTION/' + a[i].attribs['href']);
            let url = '"' + 'http://www.textfiles.com/etext/FICTION/' + a[i].attribs['href'] + '"';
            let thisTextWords = {};
            analyseText(await res.text(), object);

            let wAmount = "'"+JSON.stringify(consoleLogingResult(object))+"'";

            resultSQL.push('(' + url + ',' + wAmount + ')');

        }
        resultSQL = resultSQL.join();
            connection.connect(function (err) {
                if (err) throw err;
                console.log('Connected!');               
                let sql = `INSERT INTO text_description (text_url, words_amount) VALUES ${resultSQL}`;
                console.log(sql);
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            });

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
    })
    .catch(console.error);