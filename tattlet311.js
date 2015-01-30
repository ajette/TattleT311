
var Twit = require('twit')
var fs = require('fs')
var json2csv = require('json2csv')
var _ = require('lodash-node')
var prompt = require('prompt')

prompt.start();

var twitterConfig = JSON.parse(fs.readFileSync("twitterAuth.json", {encoding: 'utf-8'}))

var T = new Twit({
	consumer_key: twitterConfig.consumer_key,
	consumer_secret: twitterConfig.consumer_secret,
	access_token: twitterConfig.access_token,
	access_token_secret: twitterConfig.access_token_secret
});

var args = process.argv.slice(2);
if (args.length == 0) {
	console.log("No screen names provided, proceeding to scrape all replies by 311")
	prompt.get([{
	    name: 'keepGoing',
	    required: true,
    	description: "Continue (Y)?"
 	 }], function (err, result) {
  		if (err) { return }
 		if (result.keepGoing == 'Y') {
  			collectAllTweets({}, [user311].concat(args))
 		}
	});	
}
else {
	collectAllTweets({}, [user311].concat(args))
}

var user311 = 'Pgh311';

// Only pay attention to requests in last month - should make this configurable
var cutoffDate = new Date()
cutoffDate.setMonth(cutoffDate.getMonth() - 1)

// A simple regex to determine if a text is a request id or not...will have to change most likely
var requestIdMatch = /request\s*id#*\s*(\d+)/i;

// was tweet sent from fromUser to toUser and is it a "Request ID" 
function wasTweetARequestFromTo(tweet, fromUser, toUser) {
	if (tweet.user.screen_name == fromUser && 
		tweet.in_reply_to_screen_name == toUser &&
		tweet.text.match(requestIdMatch)
		) {
		return true
	}

	return false
}

// using mentions timeline means this will be tied to api key and only useful for whoever running it, not to mention only goes back 200.
// Using user_timeline though very well because pgh311 is very active so user_timeline will only go back about 2 weeks unless we loop on max_id
// pull a few times...
// it would make sense to use search/tweets but the twitter api only returns results from last week? That's dumb
// get all of the users timeline since we'll need to see if they replied to any of these...sigh
function userTimeline(whenDone, results, targetUser, users, maxId) {
	// don't pop user if this is part of recursive call
	if (targetUser == null) {
		targetUser = users.pop()
		console.log("Grabbing user timeline of " + targetUser)
	}

	if (maxId == null) {
		// I swear this was giving me 3K when testing earlier but now seems to only allow 200, well whatever
		var options = { screen_name: targetUser, count: 3000}
	}
	else {
		// if we have a maxId use that to go back in a users timeline
		var options = { screen_name: targetUser, count: 3000, max_id: maxId}
	}
	
	T.get("statuses/user_timeline", options, function(err, data, response) {
		if (err) {
			// rate limit exceeded, try again in a bit
			if (err.statusCode == 429) {
				console.log("Rate limit exceeded, trying again")
				setTimeout(function() {
					userTimeline(whenDone, results, targetUser, users, maxId);
				},
				30000
				);				
			}
		}

		var last = data[data.length - 1];
		var lastDate = new Date(last.created_at);

		if(!(targetUser in results)) {
			results[targetUser] = []
		}
		results[targetUser] = results[targetUser].concat(data);

		if (lastDate < cutoffDate) {
			// done with this user, carry on to the next ones
			whenDone(results, users);
		}
		else {
			// haven't got enough tweets from targetUser to get to the cutoff date, keep going back in time
			userTimeline(whenDone, results, targetUser, users, last.id);
		}
	});
};

// find any unreplied requests that were sent fromUser to toUser
function findUnrepliedRequestTweets(fromUser, fromTweets, toUser, toTweets) {
	var unrepliedRequests = []
	fromTweets.forEach(function(fromTweet) {		
		if (wasTweetARequestFromTo(fromTweet, fromUser, toUser)) {
			var found = true

			// make sure we are talking the relevant dates for everyone
			if (new Date(fromTweet.created_at) >= cutoffDate) {
				// did the person respond to the tweet? if so we have to assume it has been dealt with
				// until parser has a PhD in horrible
  		      	toTweets.every(function(toTweet) {    
     		   		if (toTweet.in_reply_to_status_id == fromTweet.id) {
    	    			found = false;
        				// break
        				return false
        			}
        			return true
        		});
        		// in theory 311 could respond to the request, and again we'll have to assume it has been dealt with
        		// can't have any false negatives at this point
        		fromTweets.every(function(fromTweet) {        		
        			if (fromTweet.in_reply_to_status_id == fromTweet.id) {
        				found = false;
        				// break
        				return false
        			}
        			return true
        		});
        	}
        	else {
        		found = false
        	}

        	if (found) {
        		// make an easy to cvsify field that links to status
        		fromTweet['statusIDURL'] = 'https://twitter.com/' + fromUser + '/status/' + fromTweet.id_str
        		unrepliedRequests = unrepliedRequests.concat(fromTweet);
        	}        
		}
	});

	return unrepliedRequests
}

function collectAllTweets(tweets, users) {
	// hacky end to recursion
	if (users.length == 0) {
		var unreplied = {}
		var i = 0

		for (var user in tweets) {
			if (user == user311) {
				continue
			}
			i++

			unreplied[user] = findUnrepliedRequestTweets(user311, tweets[user311], user, tweets[user])
		}
		// you done did it now - only user provided was 311, scrape all of its interactions for last month
		if (i == 0) {
			// good chance this runs into twitter api limitations btw...
			var allOtherUsers = []
			tweets[user311].forEach(function(tweet311) {
				if (tweet311.text.match(requestIdMatch)) {
					allOtherUsers.push(tweet311.in_reply_to_screen_name)
				}
			});		
			allOtherUsers = _.unique(allOtherUsers)
			// off to the races
			userTimeline(collectAllTweets, tweets, null, allOtherUsers)
			return
		}
		saveTweetsToCSV(unreplied)
		return
	}

	// throttle this so we don't run out of api requests per 15 minutes
	setTimeout(function() {
		userTimeline(collectAllTweets, tweets, null, users)
	},
	users.length > 1 ? 30000 : 0
	);		
}

// compile all our results into a csv
function saveTweetsToCSV(tweets) {
	if (tweets == undefined) {
		return
	}
	// all joined by user which is in theory useful, but for CSV let us store information together
	var flattenedTweets = []
	for (var property in tweets) {
    	if (tweets.hasOwnProperty(property)) {
        	flattenedTweets = flattenedTweets.concat(tweets[property])
    	}
	}
	json2csv({data: flattenedTweets, fields: ['in_reply_to_screen_name', 'statusIDURL', 'created_at', 'text']}, function(err, csv) {
  		if (err) console.log(err);
  		fs.writeFile('311Output.csv', csv, function(err) {
    		if (err) throw err;
    		console.log('file saved');
  		});
	});	
}

