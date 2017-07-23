let azure = require('azure-storage');
let creds = require('./credentials.json');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.tableName ) {
        let SASinfo = generateSASToken(context, req.query.tableName );
        context.res ={
             status: 200,
             headers: { 'Content-Type': 'application/json' },
             body: SASinfo
        } 
            
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a tableName on the query string"
        };
    }
    context.done();
};

function generateSASToken(context, tableName) {
    let tableService = azure.createTableService(creds.STORAGE_NAME, creds.STORAGE_KEY );

    let startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() -5);

    let endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() +60);

    permissions = azure.TableUtilities.SharedAccessPermissions.QUERY;

    let SAPolicy = {
        AccessPolicy: {
            Permissions: permissions,
            Start: startDate,
            Expiry: endDate
        }
    }
    let sasToken = tableService.generateSharedAccessSignature( tableName, SAPolicy);

    let out = {
        //token: sasToken,
        url: tableService.getUrl(tableName, sasToken, true)
    }
    return out
}