const fetch = require('node-fetch');
const cheerio = require('cheerio');
let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'textanalisator'
});

function reseiveFromPage(link) {
    fetch(link)
        .then(function (response) {
            return response.text();
        })
        .then(async function (html) {
            const $ = cheerio.load(html);
            let hrefs = $('a');
            let urlsArr = [];
            let id = 0; 
            for (let j = 1; j < hrefs.length; j++) {
                let href1 = (link + hrefs[j].attribs['href']);

                await fetch(href1)
                    .then(function (response) {
                        return response.text();
                    })
                    .then(function (html) {
                        const $ = cheerio.load(html);
                        let a = $('a');
                        for (let i = 0; i < a.length; i++) {
                            let url = '"' + href1 + '/' + a[i].attribs['href'] + '"';
                            urlsArr.push('(' + url + ')');
                        }


                    })
                    .catch(console.error);
            }
            connection.connect(function (err) {
                if (err) throw err;
                console.log('Connected!');
                let sql = `INSERT INTO text_description (text_url) VALUES ${urlsArr}`;
                console.log(sql);
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            });
            //console.log(urlsArr)

        })
        .catch(console.error);
}

let link = 'http://www.textfiles.com/etext/';

reseiveFromPage(link);


//  module.exports = {
//      a:a,
//      repage:reseiveFromPage
//     };
