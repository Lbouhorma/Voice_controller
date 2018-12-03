import * as functions from 'firebase-functions';

/*
 export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });*/
 const {dialogflow} = require('actions-on-google');
 const {google} = require('googleapis');
 const app = dialogflow({debug: true});
 /*const Contexts = {
  SEND_EMAIL: 'send_email'
};*/

function makeBody(to, from, subject, message) {
  const str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
      "MIME-Version: 1.0\n",
      "Content-Transfer-Encoding: 7bit\n",
      "to: ", to, "\n",
      "from: ", from, "\n",
      "subject: ", subject, "\n\n",
      message
  ].join('');

  const encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
      return encodedMail;
}

function sendMessage(userId, callback):any {
    // Using the js-base64 library for encoding:
    // https://www.npmjs.com/package/js-base64
    const base64EncodedEmail = makeBody('lbouhorma@gmail.com', 'lbouhorma@gmail.com', 'test subject', 'test message')
    const request = google.client.gmail.users.messages.send({
      'userId': userId,
      'resource': {
        'raw': base64EncodedEmail
      }
    });
    request.execute(callback);
  }

  function aff() { 
        console.log('sending complete')
  }

 app.intent('Send Email', (): any => {
    //conv.contexts.set(Contexts.SEND_EMAIL,5);
     sendMessage('me',aff)   

      
  });