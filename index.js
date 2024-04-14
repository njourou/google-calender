const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');


fs.readFile('credentials.json', (err, content) => {
  if (err) return console.error('Error loading client secret file:', err);

  authorize(JSON.parse(content), addEvent);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);


  fs.readFile('token.json', (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
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

      fs.writeFile('token.json', JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', 'token.json');
      });
      callback(oAuth2Client);
    });
  });
}

function addEvent(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const event = {
    summary: 'Meeting',
    description: 'Meeting with the team',
    start: {
      dateTime: new Date().toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    end: {
      dateTime: new Date().toISOString(),
      timeZone: 'Africa/Nairobi',
    },
  };

  calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  }, (err, res) => {
    if (err) return console.error('Error adding event:', err);
    console.log('Event created:', res.data.htmlLink);
  });
}
