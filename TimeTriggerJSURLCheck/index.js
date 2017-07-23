let azure = require('azure-storage');
let creds = require('./credentials.json');
let request = require('request');
let uuid = require('node-uuid');

module.exports = function (context, myTimer) {
    let now = new Date();
    let month = new Array();
    month[0] = "01";
    month[1] = "02";
    month[2] = "03";
    month[3] = "04";
    month[4] = "05";
    month[5] = "06";
    month[6] = "07";
    month[7] = "08";
    month[8] = "09";
    month[9] = "10";
    month[10] = "11";
    month[11] = "12";

    context.bindings.inputTableURLs.forEach(function(record){
        request(record.URL, function(error, res, body){
            if(!res){
                res = {};
                res.statusCode = 0;
            }
            if(res.statusCode !== 200){
                let item = {
                    PartitionKey: "urlcheck" + now.getFullYear().toString() + month[now.getMonth() ],
                    RowKey: uuid.v4(),
                    URL: '' + record.URL,
                    Status: res.statusCode.toString(),
                    Error: error ? '' + error : " "
                } ;
                try {
                    let res = []; 
                    let tableService = azure.createTableService(creds.STORAGE_NAME, creds.STORAGE_KEY );
                    tableService.insertEntity('outTableLog', item, (error, result, response) => {
                        res.push ({
                            statusCode: error ? 400 : 204,
                        });  
                    });
                }
                catch (e) {
                    context.log("Exception: ", e )
                }

            }
        });

    });   
    context.done();
};