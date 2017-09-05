const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const http = require("http");
const file = fs.createWriteStream("file.txt");
var request = require('request');

fetch('http://www.textfiles.com/etext/FICTION/')
    .then(function (response) {
        return response.text();
    })
    .then(function (html) {

        const $ = cheerio.load(html);
        let a = $('a');

        //for (var i = 0; i <= a.length; i++) {
        var inputValue = '';

        request.get('http://www.textfiles.com/etext/FICTION/' + a[0].attribs['href'], function (error, response, body) {
            if (!error && response.statusCode == 200) {
                inputValue = body
                    .replace(/[^a-zA-Z ]/g, " ")
                    .toLowerCase()
                    .replace(/\s\s+/g, ' ')
                    .split(' ');

                var object = {};

                for (var i = 0; i < inputValue.length; i++) {
                    var word = inputValue[i].toString();
                    var wordAmount = 1;

                    if (object[word]) {
                        object[word]++;
                    } else {
                        object[word] = 1;
                    }
                }

                if (object['']) {
                    delete object[''];
                }

                var array1 = [];

                Object.keys(object).forEach(key => { array1.push({ word: key, amount: object[key] }); });

                function compareAmount(wordA, wordB) {
                    return wordA.amount - wordB.amount;
                }

                array1.sort(compareAmount).reverse();



                for (var i = 1; i <= 10; i++) {
                    console.log(array1[i - 1].word +' : '+ array1[i - 1].amount);
                }
            }
        });


    })
    .catch(console.error);