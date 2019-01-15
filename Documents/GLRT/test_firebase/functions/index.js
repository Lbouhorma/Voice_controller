const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
var google = require('googleapis').google;
var Base64 = require('js-base64').Base64;

var gmail = google.gmail('v1');
const secret={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}


const app = dialogflow()


function executeCommand(params) {
        authorize(secret, sendMessage, params);
}


function authorize(credentials, callback, params) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.
    oauth2Client.credentials = {"access_token":"ya29.GltoBqJ-QesOaSJoxHQt8C3rbP6EQrxiRMiJgGiG-qpxMI1UI2vSEjaRDJX6lqy1ADsE6VR82M8BFh3cwfpJBMxB1R68OQ-9v2FJOkB7M7TRNs_r9SweKs_WjSZg","refresh_token":"1/XGhBeRzaCD5urhLnbSwef9Nl_9FQzyeuuX4oSu9YRWc","scope":"https://mail.google.com/","token_type":"Bearer","expiry_date":1543939550745};
    callback(oauth2Client, params);
}
    

function makeBody(to, subject, message) {
        var email = 'To: "first last" <'
            + to +
            '>\r\nContent-type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: '
            + subject +
            '\r\n\r\n'
            + message;
        var encodedMail = Base64.encodeURI(email);
        console.log("email:", encodedMail);
        return encodedMail;
}

function sendMessage(auth, params) {
        var to ='lbouhorma@gmail.com'; //params[0];
        var subject = params[1];//'Test Voice Controller 3';
        var message = params[2]; //'Ceci est un test.';
        var encodedMail = makeBody(to, subject, message);

        gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
                'raw': encodedMail
            } }, (err, response) =>{
            if (err)
                throw err;
        console.log(response);
        });
}

app.intent("SendEmail - Content - yes", (conv,params) => {
        const givenName=params['given-name'];
        // const lastName=params['last-name'];
        const subject=params['subject'];
        const content=params['content'];
        const emailParams= [givenName, subject, content];
         executeCommand(emailParams);
        conv.ask('Message sent to ', givenName);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements