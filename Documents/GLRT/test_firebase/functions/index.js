const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
var fs = require('fs');
var google = require('googleapis').google;
var Base64 = require('js-base64').Base64;
// If modifying these scopes, deconste your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
var SCOPES = ['https://mail.google.com/'];
// Change token directory to your system preference
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';
console.log(TOKEN_PATH, TOKEN_DIR)
var gmail = google.gmail('v1');
const token = {"web":{"client_id":"1076911792520-to3861j5tj7cudr7q9s3ac2di9mdrghv.apps.googleusercontent.com","project_id":"fulfillment-test-ae1b2","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"Eltoc3J7orYR_YNWiJK4GVy0","redirect_uris":["https://fulfillment-test-ae1b2.firebaseapp.com/__/auth/handler","https://oauth-redirect.googleusercontent.com/r/fulfillment-test-ae1b2"],"javascript_origins":["http://localhost","http://localhost:5000","https://fulfillment-test-ae1b2.firebaseapp.com"]}}
// const secret={"installed":{"client_id":"1076911792520-iqkqpegnkv7juutj1tbp2v0ihggjg5f3.apps.googleusercontent.com","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"NzIR08zvd1mO-0-Szd4PI1Aw","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
const secret={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}

//const sendMessage = functions.sendMessage();
//const executeCommand= require("./gmail")


const app = dialogflow()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

function executeCommand() {
        console.log("executing");
        authorize(secret, sendMessage);
}
// executeCommand();

function getNewToken(oauth2Client, callback, conv) {
        var authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
        conv.ask('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ',  (code) => {
            rl.close();
            oauth2Client.getToken(code,  (err, token) => {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
                callback(oauth2Client);
            });
        });
    }




function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.
    oauth2Client.credentials = {"access_token":"ya29.GltoBqJ-QesOaSJoxHQt8C3rbP6EQrxiRMiJgGiG-qpxMI1UI2vSEjaRDJX6lqy1ADsE6VR82M8BFh3cwfpJBMxB1R68OQ-9v2FJOkB7M7TRNs_r9SweKs_WjSZg","refresh_token":"1/XGhBeRzaCD5urhLnbSwef9Nl_9FQzyeuuX4oSu9YRWc","scope":"https://mail.google.com/","token_type":"Bearer","expiry_date":1543939550745};
    callback(oauth2Client);
}
    

function makeBody(to, subject, message) {
        var email = 'To: "first last" <'
            + to +
            '>\r\nContent-type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: '
            + subject +
            '\r\n\r\n'
            + message;
        var encodedMail = Base64.encodeURI(email);
        return encodedMail;
}

function sendMessage(auth) {
        console.log("sending message", auth);
        /* Example of data */
        var to = 'lbouhorma@gmail.com';
        var subject = 'Test Voice Controller 3';
        var message = 'Ceci est un test.';
        var encodedMail = makeBody(to, subject, message);
        gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
                'raw': encodedMail
            } }, (err, response) =>{
            if (err)
                throw err;
        console.log(response);
        });
}

app.intent("Default Welcome Intent", conv => {
        console.log('starting to execute', conv)
         executeCommand();
        conv.ask('Trying to send')
});
    
executeCommand(null)


//export const sendMessage = functions.https.onRequest(app)
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements