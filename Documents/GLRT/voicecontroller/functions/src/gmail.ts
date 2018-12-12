const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const base64url = require('base64url');
const Base64= require('js-base64').Base64
// If modifying these scopes, deconste your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
const SCOPES = [ 'https://mail.google.com/'];
// Change token directory to your system preference
const TOKEN_DIR =(process.env.HOME || process.env.HOMEPATH ||
   process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';
console.log(TOKEN_DIR, TOKEN_PATH)
const gmail = google.gmail('v1');
// Load client secrets from a local file.
export default function executeCommand(){
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
 if (err) {
   console.log('Error loading client secret file: ' + err);
   return;
 }
 // Authorize a client with the loaded credentials, then call the
 // Gmail API.
//  authorize(JSON.parse(content),getRecentEmail);
  authorize(JSON.parse(content),  sendMessage)
});
}

executeCommand();
/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
*
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
   const clientSecret = credentials.installed.client_secret;
   const clientId = credentials.installed.client_id;
   const redirectUrl = credentials.installed.redirect_uris[0];
   const OAuth2 = google.auth.OAuth2;
   const oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);
   // Check if we have previously stored a token.
   fs.readFile(TOKEN_PATH, function(err, token) {
     if (err) {
       getNewToken(oauth2Client, callback);
     } else {
       oauth2Client.credentials = JSON.parse(token);
       callback(oauth2Client);
     }
   });
}
/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
*
* @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback to call with the authorized
*     client.
*/
function getNewToken(oauth2Client, callback) {
 const authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
 console.log('Authorize this app by visiting this url: ', authUrl);
 const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
 });
 rl.question('Enter the code from that page here: ', function(code) {
   rl.close();
   oauth2Client.getToken(code, function(err, token) {
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
/**
* Store token to disk be used in later program executions.
*
* @param {Object} token The token to store to disk.
*/
function storeToken(token) {
 try {
   fs.mkdirSync(TOKEN_DIR);
 } catch (err) {
   if (err.code != 'EEXIST') {
     throw err;
   }
 }
 fs.writeFile(TOKEN_PATH, JSON.stringify(token));
 console.log('Token stored to ' + TOKEN_PATH);
}
/**
* Get the recent email from your Gmail account
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/

function getRecentEmail(auth) {
   // Only get the recent email - 'maxResults' parameter
   gmail.users.messages.list({auth: auth, userId: 'me'}, function(err, response) {
       /*console.log("reponse : " )
       console.log(response.data.resultSizeEstimate)*/
      
       if (err) {
           console.log('The API returned an error: ' + err);
           return;
       }
     // Get the message id which we will need to retreive tha actual message next.
      
     //const message_id = response['data']['messages'][0]['id'];
    
     console.log("message_id of all messages: ");
   
     for (let k = 0; k < response.data.resultSizeEstimate; k++) {
           console.log(response['data']['messages'][k]['id']);
           const message_id = response['data']['messages'][k]['id'];
           let num_msg=0;
           gmail.users.messages.get({auth: auth, userId: 'me','id': message_id}, function(err, response) {
           console.log("             ");
           console.log("             ");
           console.log("--------------------------------------");
           const contact_json = response['data'].payload.headers.find( el => el.name === 'From');
           console.log("Contact: " + contact_json.value);
           console.log("             ");
           const date_json = response['data'].payload.headers.find( el => el.name === 'Date');
           console.log("Date: " + date_json.value);
           console.log("             ");
           const subject_json = response['data'].payload.headers.find( el => el.name === 'Subject');
           console.log("Subject: " + subject_json.value);
           console.log("             ");
           console.log("Message number "+num_msg+"        ");
           num_msg++;
           if (err) {
             console.log('The API returned an error: ' + err);
             return;
           }
           console.log(base64url.decode(response.data.payload.parts[0].body.data));
          

         });
    
       }
     
     // Retreive the actual message using the message id

   });
 

}
const store_id=(f,param)=>{
 const result=[];
 //new Array(param.length);
 for (const el in param){
     console.log(param[el]);
     result.push(f(param[el]));
 }
return result;
};
/**
* Retrieve Messages in user's mailbox matching query.
*
* @param  {String} userId User's email address. The special value 'me'
* can be used to indicate the authenticated user.
* @param  {String} query String used to filter the Messages listed.
* @param  {Function} callback Function to call when the request is complete.
/**
* Lists the labels in the user's account.
*
* @param {google.auth.OAuth2} auth An authorized OAuth2 client.
*/
function listLabels(auth) {
 gmail.users.labels.list({auth: auth, userId: 'me',}, function(err, response) {
   if (err) {
     console.log('The API returned an error: ' + err);
     return;
   }
   const labels = response.data.labels;
   if (labels.length == 0) {
     console.log('No labels found.');
   } else {
     console.log('Labels:');
     for (let i = 0; i < labels.length; i++) {
       const label = labels[i];
       console.log('%s', label.name);
     }
   }
 });
 }
 function makeBody(to, subject, message) {

  const email = 'To: "first last" <' 
               + to + 
               '>\r\nContent-type: text/html;charset=iso-8859-1\r\nMIME-Version: 1.0\r\nSubject: ' 
               + subject + 
               '\r\n\r\n' 
               + message;
 
 const encodedMail = Base64.encodeURI(email);
 return encodedMail;
}


function sendMessage(auth) {

  /* Example of data */
  const to = 'lbouhorma@gmail.com';
  const subject = 'Test Voice Controller 3';
  const message = 'Ceci est un test.';

 const encodedMail = makeBody(to, subject, message);
 gmail.users.messages.send({'auth': auth, 'userId': 'me',  'resource': {
 'raw': encodedMail,


 }},function(err,response){

 if(err) throw err;

 console.log(response);
});
}

// export= executeCommand();