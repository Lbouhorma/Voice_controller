
const functions = require('firebase-functions');
const { dialogflow } = require('actions-on-google');
var google = require('googleapis').google;
var Base64 = require('js-base64').Base64;
var g = require('./people');
var gmail = google.gmail('v1');
const secret={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
const peopleCredentials = { access_token: 'ya29.GluXBgP70XkgBdqYr107NyXEHNQEQkb4rMW7igp6C3biL8us8OBUhucHzdvpmE8jN5RGT4Fm_zRKsZoyPWBVPYbD-d4Od5jQ59F4RBurA1GkX9DCg_MeycuA_C2H',
refresh_token: '1/XtwMA8-hLMzTcX2Fm_FL7Ry0OkOH0pUcfrmEZc21dos',
scope: 'https://www.googleapis.com/auth/contacts',
token_type: 'Bearer',
expiry_date: 1548006165017 };

const gmailCredentials=  {"access_token":"ya29.GltoBqJ-QesOaSJoxHQt8C3rbP6EQrxiRMiJgGiG-qpxMI1UI2vSEjaRDJX6lqy1ADsE6VR82M8BFh3cwfpJBMxB1R68OQ-9v2FJOkB7M7TRNs_r9SweKs_WjSZg","refresh_token":"1/XGhBeRzaCD5urhLnbSwef9Nl_9FQzyeuuX4oSu9YRWc","scope":"https://mail.google.com/","token_type":"Bearer","expiry_date":1543939550745};
const app = dialogflow()

var peopleList = [];
var emailParams = ["", "", "", "", ""];

function authorize(credentials, callback, scopeCredentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        // Check if we have previously stored a token.
    oauth2Client.credentials = scopeCredentials;
    return new Promise(resolve => {
        callback(oauth2Client); 
        resolve();
    })
}
    
/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listConnectionNames(auth) {
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
        var email = getEmail(peopleList);
        emailParams[2] = email;
        
      } else {
        console.log('No connections found.');
        return "Email not found";
      }
    });
}

function getEmail(peopleList){
     var name = emailParams[0] +" "+ emailParams[1];
     console.log("name",name);
    var email="undefined";
    peopleList.forEach(person => {
        if (person.name === name){
            email = person.email; 
        }  
    });
    console.log("email", email);
    return email;
}


function sendMessage(auth) {
    
        var to =emailParams[2];
        var subject = emailParams[3];
        var message = emailParams[4]; 
        var encodedMail = makeBody(to, subject, message);
        
        gmail.users.messages.send({ 'auth': auth, 'userId': 'me', 'resource': {
                'raw': encodedMail
            } }, (err, response) =>{
            if (err)
                throw err;
        console.log(response.status);
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

    return encodedMail;
}

function asyncCall(){
    return new Promise(resolve => {
        authorize(secret, listConnectionNames, peopleCredentials).then(()=>{
            console.log("authorize complete");
            }); 
        resolve();
    })
}

app.intent('SendEmail - Name', (conv,params) => {
    const givenName=params['given-name'];
    const lastName=params['last-name'];
    emailParams[0] = givenName;
    emailParams[1] = lastName;
    
    asyncCall().then(()=> {
        console.log("async call email", emailParams);
        if (emailParams[2]==="undefined") {
            console.log("Contact not found.");
            conv.ask( emailParams[0] + ' ' + emailParams[1] +' is not on your contact list. Please say Add a new contact.');
        }
        else {
            console.log("Contact found.");
            conv.ask('Do you want to send an email to '+emailParams[0]+' '+emailParams[1] +'?');
        }
    })
        
});


function createContact(auth){
    const service = google.people({version: 'v1', auth});
    service.people.createContact({
          parent: 'me',
          resource: {
            names: [
              {
                givenName: emailParams[0],
                familyName: emailParams[1]
              }
            ],
            emailAddresses: [
              {
                value: emailParams[2]
              }
            ]
          }
        }, (err, res) => {
          if (err) return console.error('The API returned an error: ' + err);
          console.log(res);
        })
}
      

    
app.intent('Add contact - Mail - yes',(conv,params)=> {
        emailParams[0] = params['given-name'];
        emailParams[1] = params['last-name'];
        emailParams[2] = params['email'];
        authorize(secret, createContact, peopleCredentials);
        conv.ask(emailParams[0]+' '+emailParams[1]+' with adress '+emailParams[2]+' added to contact! To send a mail say "new email", to go to the menu say "menu"');
})

app.intent("SendEmail - Content - yes", (conv,params) => {
 
    const subject=params['subject'];
    const content=params['content'];
    emailParams[3] = subject;
    emailParams[4] = content;
    
    authorize(secret, sendMessage, gmailCredentials);
    const response = 'Message sent to '+ emailParams[0] +' '+ emailParams[1];
    conv.ask(response);
    emailParams = ["", "", "", "", ""];
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
process.env.DEBUG = 'dialogflow:debug';