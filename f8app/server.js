
import express from 'express';
import Parse from 'parse/node';
import {ParseServer} from 'parse-server';
import ParseDashboard from 'parse-dashboard';
var request = require('request');
var CronJob = require('cron').CronJob;
var fs = require('fs');
var util = require('util');

const MASTER_KEY = 'rwscoolguy';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

Parse.initialize('oss-f8-app-2016');
Parse.serverURL = `http://localhost:8080/parse`;

var gresults = [];

var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

function updatePlayer( i, url )
{
	var object = gresults[i];
// did this fix it? gotta fix this -----------------
	if(!object)
		return;
	gresults[i].hindex=0;
//-----------------------------
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var s = body.indexOf("ctl00_bodyMP_lblName");
		if(s<0)
		{
			console.log(gresults[i].get('named'));
			console.log( "NOT FOUND body.indexOf(ctl00_bodyMP_lblName)");
			return;
		}
		var nameblob = body.slice(s,s+60);
		for (var ii = 0; ii < gresults.length; ii++)
		{
			if(gresults[ii].hindex > 0)
				continue;
			var named = gresults[ii].get('fname') + ' ' + gresults[ii].get('lname');
			var x = nameblob.indexOf(named);
			if(x>0)
				break;
		}
		if(ii==gresults.length)
		{
			console.log(gresults[i].get('named'));
			console.log(nameblob);
			console.log( "NOT FOUND "+gresults[i].get('fname') + ' ' + gresults[i].get('lname'));
			return;
		}
		var n = body.indexOf("ClubGridHandicapIndex");
		if(n<0)
		{
			console.log(gresults[i].get('named'));
			console.log( "NOT FOUND body.indexOf(ClubGridHandicapIndex)");
			return;
		}
		var res = body.slice(n,n+200);

		var res1 = res.split(">");
		if(!res1[2])
		{
			console.log(gresults[i].get('named'));
			console.log(res);
			console.log( "res.split(>)");
			return;
		}
		n = res1[2].indexOf("<");
		if(n<0)
		{
			console.log(gresults[i].get('named'));
			console.log(res1[2]);
			console.log( "res1[2].indexOf(<)");
			return;
		}
		var hindex =res1[2].slice(0,n);
		gresults[ii].hindex = hindex;
//		console.log(gresults[ii]);
		gresults[ii].set('hindex',Number(hindex));
		gresults[ii].save(null, {
			success: function(player) {
				console.log('Updated object : ' + player.get('named')+' hindex='+player.get('hindex'));
			},
			error: function(player, error) {
				console.log('Failed to create new object, with error code: ' + error.message);
				console.log(player);
			}
		});
	  }
	  else
		console.log(gresults[i].get('named')+" response.statusCode = "+response.statusCode);

	});
}


function waitPlayer( i,url )
{
	setTimeout(	function(){ updatePlayer(i,url); }, i*5000);
}

function nonkeyPlayers(className) {
  console.log('Loading nonkeyPlayers... '+ className);
  const ClassType = Parse.Object.extend(className);
  var query = new Parse.Query(ClassType);
  query.doesNotExist("ghinnokey");
  query.doesNotExist("findex");
  query.find({
		success: function(results) {
//			console.log(results);
			console.log("Successfully retrieved " + results.length + " players.");
			gresults = results;
			for (var i = 0; i < gresults.length; i++) {
				var object = gresults[i];
//				console.log(gresults[i]);
				var fname = object.get('fname');		// remove space in First Name
				var n = fname.indexOf(" ");
				if(n>0)
					fname = object.get('fname').slice(0,n);
				var url = 'http://widgets.ghin.com/HandicapLookup.aspx?entry=1&st='+object.get('state')+'&ln='+object.get('lname').toLowerCase()+'&fn='+fname.toLowerCase();
				waitPlayer( i, encodeURI(url) );
			}
		},
		error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		}
	});
}

function keyPlayers(className) {
  console.log('Loading keyPlayers... '+ className);
  const ClassType = Parse.Object.extend(className);
  var query = new Parse.Query(ClassType);
  query.exists("ghinnokey");
  query.find({
		success: function(results) {
			console.log("Successfully retrieved " + results.length + " players.");
			gresults = results;
			for (var i = 0; i < gresults.length; i++) {
				var object = gresults[i];
				var url = 'http://widgets.ghin.com/HandicapLookupResults.aspx?entry=1&ghinnokey='+object.get('ghinnokey');
				waitPlayer( i,url );
			}
		},
		error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		}
	});
}



var job = new CronJob('00 00 10,22 * * 1-7', function() {
	var test =  nonkeyPlayers('Players');
  }, function () {  
  },
  true
);

var job2 = new CronJob('00 00 9,21 * * 1-7', function() {
	var test =  keyPlayers('Players');
  }, function () {  
  },
  true
);


//var test =  nonkeyPlayers('Players');
//var test =  keyPlayers('Players');

/* multiple Parse server code, cloud wont work
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dev', // Connection string for your MongoDB database
  cloud: '/home/parse/parse-server/cloud/main.js', // Absolute path to your Cloud Code
  appId: 'bb',
  masterKey: 'your-master-key', // Keep this key secret!
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});
app.use('/parse/bb', api);

var api2 = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dev2', // Connection string for your MongoDB database
  cloud: '/home/parse/parse-server/cloud/main.js', // Absolute path to your Cloud Code
  appId: 'cc',
  masterKey: 'your-master-key', // Keep this key secret!
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});
app.use('/parse/cc', api2);

app.listen(1337, function() {
  console.log('parse-server-example running on port 1337.');
});
*/

const server = express();

server.use(
  '/parse',
  new ParseServer({
    databaseURI: 'mongodb://localhost:27017/dev',
//    cloud: path.resolve(__dirname, 'cloud.js'),
    appId: 'oss-f8-app-2016',
    masterKey: MASTER_KEY,
    fileKey: 'f33fc1a9-9ba9-4589-95ca-9976c0d52cd5', 				//For migrated apps, this is necessary to provide access to files already hosted on Parse.
    serverURL: `http://localhost:8080/parse`,
	// Enable email verification
	verifyUserEmails: false,
//	verbose: true,
	

	  // if `verifyUserEmails` is `true` and
	  //     if `emailVerifyTokenValidityDuration` is `undefined` then
	  //        email verify token never expires
	  //     else
	  //        email verify token expires after `emailVerifyTokenValidityDuration`
	  //
	  // `emailVerifyTokenValidityDuration` defaults to `undefined`
	  //
	  // email verify token below expires in 2 hours (= 2 * 60 * 60 == 7200 seconds)
	  emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)

	  // set preventLoginWithUnverifiedEmail to false to allow user to login without verifying their email
	  // set preventLoginWithUnverifiedEmail to true to prevent user from login if their email is not verified
	  preventLoginWithUnverifiedEmail: false, // defaults to false

	  // The public URL of your app.
	  // This will appear in the link that is used to verify email addresses and reset passwords.
	  // Set the mount path as it is in serverURL
	  publicServerURL: 'http://159.203.92.162:8080/parse',
	  // Your apps name. This will appear in the subject and body of the emails that are sent.
	  appName: 'Strokers',
	  // The email adapter
	  emailAdapter: {
		module: 'parse-server-simple-mailgun-adapter',
		options: {
		  // The address that your emails come from
		  fromAddress: 'rodger@synappsys.com',
		  // Your domain from mailgun.com
		  domain: 'sandboxa5373d861d9c4682b9c7ac7c29c9de37.mailgun.org',
		  // Your API key from mailgun.com
		  apiKey: 'key-fcb144a562e6209ea838c40e79e3a29c',
		}
	  },

	  // account lockout policy setting (OPTIONAL) - defaults to undefined
	  // if the account lockout policy is set and there are more than `threshold` number of failed login attempts then the `login` api call returns error code `Parse.Error.OBJECT_NOT_FOUND` with error message `Your account is locked due to multiple failed login attempts. Please try again after <duration> minute(s)`. After `duration` minutes of no login attempts, the application will allow the user to try login again.
	  accountLockout: {
		duration: 5, // duration policy setting determines the number of minutes that a locked-out account remains locked out before automatically becoming unlocked. Set it to a value greater than 0 and less than 100000.
		threshold: 3, // threshold policy setting determines the number of failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
	  },
	  push: {
/*		android: {
			senderId: '', // The Sender ID of GCM
			apiKey: '' // The Server API Key of GCM
		},
*/
/*
ios: [
    {
      pfx: '', // Dev PFX or P12
      bundleId: '',
      production: false // Dev
    },
    {
      pfx: '', // Prod PFX or P12
      bundleId: '',  
      production: true // Prod
    }
  ]
*/
		ios: {
			pfx: 'certs/pushwooshnopass.p12', // the path and filename to the .p12 file you exported earlier. 
			bundleId: 'com.rwscameras.Strokers', // The bundle identifier associated with your app
			production: false, // Specifies which environment to connect to: Production (if true) or Sandbox
//			passphrase: 'cobalt4000'
		}
	},	  

  })
);

/*
server.use(
  '/rwstest',
  new ParseServer({
    databaseURI: 'mongodb://localhost:27017/rwstest',
    cloud: path.resolve(__dirname, 'cloud.js'),
    appId: 'RWSTEST',
    masterKey: '70c6093dba5a7e55968a1c7ad3dd3e5a74aabbcc',
    fileKey: 'f33fc1a9-9ba9-4589-95ca-9976c0d5aabb',
    serverURL: `http://localhost:8080/rwstest`,
	// Enable email verification
	  verifyUserEmails: false,

	  // if `verifyUserEmails` is `true` and
	  //     if `emailVerifyTokenValidityDuration` is `undefined` then
	  //        email verify token never expires
	  //     else
	  //        email verify token expires after `emailVerifyTokenValidityDuration`
	  //
	  // `emailVerifyTokenValidityDuration` defaults to `undefined`
	  //
	  // email verify token below expires in 2 hours (= 2 * 60 * 60 == 7200 seconds)
	  emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)

	  // set preventLoginWithUnverifiedEmail to false to allow user to login without verifying their email
	  // set preventLoginWithUnverifiedEmail to true to prevent user from login if their email is not verified
	  preventLoginWithUnverifiedEmail: false, // defaults to false

	  // The public URL of your app.
	  // This will appear in the link that is used to verify email addresses and reset passwords.
	  // Set the mount path as it is in serverURL
	  publicServerURL: 'http://159.203.92.162:8080/rwstest',
	  // Your apps name. This will appear in the subject and body of the emails that are sent.
	  appName: 'Strokers',
	  // The email adapter
	  emailAdapter: {
		module: 'parse-server-simple-mailgun-adapter',
		options: {
		  // The address that your emails come from
		  fromAddress: 'rodger@synappsys.com',
		  // Your domain from mailgun.com
		  domain: 'sandboxa5373d861d9c4682b9c7ac7c29c9de37.mailgun.org',
		  // Your API key from mailgun.com
		  apiKey: 'key-fcb144a562e6209ea838c40e79e3a29c',
		}
	  },

	  // account lockout policy setting (OPTIONAL) - defaults to undefined
	  // if the account lockout policy is set and there are more than `threshold` number of failed login attempts then the `login` api call returns error code `Parse.Error.OBJECT_NOT_FOUND` with error message `Your account is locked due to multiple failed login attempts. Please try again after <duration> minute(s)`. After `duration` minutes of no login attempts, the application will allow the user to try login again.
	  accountLockout: {
		duration: 5, // duration policy setting determines the number of minutes that a locked-out account remains locked out before automatically becoming unlocked. Set it to a value greater than 0 and less than 100000.
		threshold: 3, // threshold policy setting determines the number of failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
	  },

  })
);
*/

if (IS_DEVELOPMENT) {
  let users;
  server.use(
    '/dashboard',
    ParseDashboard({
      apps: [
		{
			serverURL: '/parse',
			appId: 'oss-f8-app-2016',
			masterKey: MASTER_KEY,
			appName: 'F8-App-2016',
		}
/*		,
		{
			serverURL: '/rwstest',
			appId: 'RWSTEST',
			masterKey: '70c6093dba5a7e55968a1c7ad3dd3e5a74aabbcc',
			appName: 'rwsApp-2016',
		}
*/
	  ],
	  users: [
        {
        "user": "rws",
        "pass": "cobalt4000"
        }
        ]
/*     users, */
    }, IS_DEVELOPMENT),
  );
}

server.listen(8080, () => console.log(
  `Server is now running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:8080`
));

//console.log("We are here");
