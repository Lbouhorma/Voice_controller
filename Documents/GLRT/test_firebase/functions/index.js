
const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
var google = require('googleapis').google;
var Base64 = require('js-base64').Base64;
var g = require('./people');
var gmail = google.gmail('v1');
const secret={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
const peopleCredentials = { "access_token": 'ya29.GluVBh00jE51rmHKysr8rQFCqRr_-OIulp6CUEJUymdbFpsNOuPpIvDtFsawoa7ss-bZKk0l38zW52okGnNkbad1ospUXioMkx-X9yJlE6-wWen_A67VYlLWTc3P',
  "refresh_token": '1/bHnmlGkJrblH5F2WLSk9qmNZZ9592pMpMy3wCvRhHZ8',
  "scope": 'https://www.googleapis.com/auth/contacts.readonly',
  "token_type": 'Bearer',
  "expiry_date": 1547812090029 };

const gmailCredentials=  {"access_token":"ya29.GltoBqJ-QesOaSJoxHQt8C3rbP6EQrxiRMiJgGiG-qpxMI1UI2vSEjaRDJX6lqy1ADsE6VR82M8BFh3cwfpJBMxB1R68OQ-9v2FJOkB7M7TRNs_r9SweKs_WjSZg","refresh_token":"1/XGhBeRzaCD5urhLnbSwef9Nl_9FQzyeuuX4oSu9YRWc","scope":"https://mail.google.com/","token_type":"Bearer","expiry_date":1543939550745};
const app = dialogflow()

var peopleList = [];

function authorize(credentials, callback, params, scopeCredentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.
    oauth2Client.credentials = scopeCredentials;
    callback(oauth2Client, params);
}
    


function getEmail(peopleList, emailParams){
     var name = emailParams[0] +" "+ emailParams[1];
     console.log("name",name);
    // console.log("list on get:",peopleList);
    //  console.log("params on get: ", emailParams);
    var email;//= "lbouhorma@gmail.com";
    peopleList.forEach(person => {
        console.log(person);
        if (person.name === name){
            email = person.email; 
        }  
    });
    return email;
  }

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listConnectionNames(auth, emailParams) {
    const service = google.people({version: 'v1', auth});
    service.people.connections.list({
      resourceName: 'people/me',
      pageSize: 411,
      personFields: 'names,emailAddresses',
    }, (err, res) => {
      if (err) return console.error('The API returned an error: ' + err);
      const connections = res.data.connections;
      if (connections) {
        connections.forEach((person) => {
            if (person.names && person.names.length > 0 && person.emailAddresses) {
                peopleList.push({name: person.names[0].displayName,  email: person.emailAddresses[0].value })
            }
        });
        var email = getEmail(peopleList, emailParams);
        emailParams.push(email);
        authorize(secret, sendMessage, emailParams, gmailCredentials);
      } else {
        console.log('No connections found.');
        return "Email not found";
      }
    });
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

        var to =params[4];
        var subject = params[2];
        var message = params[3]; 
        var encodedMail = makeBody(to, subject, message);
        
        gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
                'raw': encodedMail
            } }, (err, response) =>{
            if (err)
                throw err;
        console.log(response.status);
        });
}

app.intent('SendEmail - Name',(conv,params)=> {
        const givenName=params['given-name'];
        const lastName=params['last-name'];
        // if (givenName ==='Jean' && lastName ==='Dupont'){
            conv.ask('Do you want to send an email to '+givenName+' '+lastName +'?');
        // }
        // else{
            // conv.ask(givenName+' '+lastName+' is not in your contact list. Please say Add a new contact');
        // }
        
    });
    
app.intent('Add contact - Mail - yes',(conv,params)=> {
        const givenName=params['given-name'];
        const lastName=params['last-name'];
        const email=params['email'];
        conv.ask(givenName+' '+lastName+' with adress '+email+' added to contact! To send a mail say "new email", to go to the menu say "menu"');
        
})

app.intent("SendEmail - Content - yes", (conv,params) => {
    const givenName=params['given-name'];
    const lastName=params['last-name'];
    const subject=params['subject'];
    const content=params['content'];
    const emailParams= [givenName,lastName, subject, content];
    authorize(secret, listConnectionNames, emailParams, peopleCredentials);
    
    
    
    const response = 'Message sent to '+ givenName +' '+ lastName;
    conv.ask(response);
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements