import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const executeCommand= require("./gmail")
export const sendMessage = functions.https.onRequest((request, response) => {
  executeCommand();
 });