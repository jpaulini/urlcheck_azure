let azure = require('azure-storage');
let creds = require('./credentials.json');
let request = require('request');


module.exports = function (context, req) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };

    let now = new Date();
    
    let tableService = azure.createTableService(creds.STORAGE_NAME, creds.STORAGE_KEY );

    let previousDays = req.query.prevDays || 1 ;
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - previousDays);
    
    let partition = req.query.partition || "urlcheck" + startDate.getFullYear().toString() +
                                                        pad(startDate.getUTCMonth() + 1) ;

    let queryText = "PartitionKey ge '" + partition + "' and Timestamp ge datetime'" +
                    new Date(startDate).toISOString() + "'";

    let query = new azure.TableQuery()
                    .where(queryText);

    function sendResponse(error, data, callback){
        if(!error){
                    context.res = {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }, 
                        body: {
                            query: queryText,
                            result : {
                                 count: data.length,
                                 entities: data
                                 } 
                        }
                    } 
        }   else {
                    context.res = {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }, 
                        body: {},
                        error: JSON.stringify(error)
                    }
        }
        callback();
    };

    function runQuery(error, result, response, cb){
        if(!error) {
            // query was successful
            context.log("query succesfull. Entities: " + result.entries.length);
            sendResponse(null, result.entries, context.done );
        } else {
            context.log("error processing query" + error);
            sendResponse(error, {}, context.done )
        }
    };
    tableService.queryEntities(creds.TABLE_NAME, query, null, runQuery);
    
    context.log('JavaScript HTTP trigger function processed a request.\n Partition: ' + partition +
     " from Date: " + new Date(startDate).toISOString());
    
    
};