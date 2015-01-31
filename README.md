# TattleT311
Find out requests from @pgh311 that have not been followed up on. A dirty script to remind me to remind 311 that requests have been unfulfilled. It's unclear to me why a government service designed to help the population doesn't instruct them to follow up on tickets that have not been resolved, putting the honus on onus on citizens.

# What does it do?
It pulls requests sent from 311 via twitter to the user provided on the command prompt. By default it looks at the last month and writes these requests to a CSV file.

# What do I need to run it?
node. As it uses the twitter API you will need those credentials. They should be provided in twitterAuth.json.

```json
{
   "consumer_key":         "...",
   "consumer_secret":      "...",
   "access_token":         "...",
   "access_token_secret":  "..."
}
```

# How do I run it from the command line?
```bash
# Find unreplied to requests for usernames provided
node tattlet311.js <username> <username> <...>
# Find all recent unreplied to requests
node tattlet311.js
```

## Are you a terrible asynchronous programmer?

Absolutely.
