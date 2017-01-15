"use strict";

const request = require('request');

function check4_404(url, callback){
    request(url, (err, response, body) => {
        if(err){
            return callback(err);
        }
        callback(null, response.statusCode);
    });
}

check4_404(process.argv[2], (err, data) => {
    if(err){
        return console.log(`Error: ${err}`);
    }
    console.log(`Data: ${data}`);
});