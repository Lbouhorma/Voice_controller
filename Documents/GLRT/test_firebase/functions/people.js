const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];

const TOKEN_PATH = 'token.json';

const content ={"installed":{"client_id":"586480029881-4a5khp4t8iobeo9gnpejp6lfviutjqv2.apps.googleusercontent.com","project_id":"voice-controller-57710","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"z8UsiOmo7GKZux6sSangzEmS","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}};

// authorize(content, listConnectionNames);


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    // console.log(token);
    if (err) {
      // console.log("getting new token");
      return getNewToken(oAuth2Client, callback);}
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log(oAuth2Client.credentials);
   console.log("cb:",  callback(oAuth2Client));
  });
}

var peopleList = [];

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Print the display name if available for 10 connections.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listConnectionNames(auth) {
  const service = google.people({version: 'v1', auth});
  var email;
  var mail = service.people.connections.list({
    resourceName: 'people/me',
    pageSize: 410,
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
      email = getEmail(peopleList);
      console.log("d ans la boucle", email)
      // emailParams.push(email);
       return email;
    } else {
      console.log('No connections found.');
      return "Email not found";
    }
  });
  console.log("mail", mail)
}




function getEmail(peopleList){
  const name = "Lyna Bouhorma"; // emailParams[0] + emailParams[1];
  // console.log("list on get:",peopleList);
  // console.log("params on get: ", emailParams);
  var email = "lbouhorma@gmail.com";
  console.log("peopleList on getEmail", peopleList);
  peopleList.forEach(person => {
      if (person.name === name){
          email = person.email   
      }  
  });
  console.log("contact found", email);
  return email;
}