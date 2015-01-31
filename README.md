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
# What does sample output look like?

A random sample from recent data in csv format:

| in_reply_to_screen_name | statusIDURL                                          | created_at                     | text                                                                                                                                                    |
|-------------------------|------------------------------------------------------|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| lupeopal                | https://twitter.com/Pgh311/status/550288370317156352 | Wed Dec 31 13:52:26 +0000 2014 | @lupeopal Request ID# 129384 submitted to DPW to address potholes on East St b/t Hazlet &amp; Mt Pleasant &amp; Colby St b/t Regulus &amp; Sirius.      |
| artichkme               | https://twitter.com/Pgh311/status/551028933706416128 | Fri Jan 02 14:55:10 +0000 2015 | @artichkme @pgh2o We have updated Request ID# 94236 w/ @pgh2o as they schedule proper repairs to collapsing sewer @ Eberhardt/Froman Sts                |
| PGHPUBS                 | https://twitter.com/Pgh311/status/550303793955737600 | Wed Dec 31 14:53:43 +0000 2014 | @PGHPUBS Request ID# 129399 submitted to Environmental Service to address violations @ 1100 E Carson Street (rear of property)                          |
| TableforOne             | https://twitter.com/Pgh311/status/551110772739555328 | Fri Jan 02 20:20:22 +0000 2015 | @TableforOne Original Request ID# 124219 updated &amp; Forwarded back to local Police Zone to address residents regarding violation.                    |
| Bram_R                  | https://twitter.com/Pgh311/status/551113614825115648 | Fri Jan 02 20:31:39 +0000 2015 | @Bram_R Request ID# 129552 submitted to DPW Transportation &amp; Engineering to evaluate timing &amp; vehicle/pedestrian traffic. Thank you!            |
| mitch2656               | https://twitter.com/Pgh311/status/551118040960888832 | Fri Jan 02 20:49:14 +0000 2015 | @mitch2656 We were able to locate your initial tweet Request ID# 418406 updated &amp; will be addressed by DPW crews as weather/season permits          |
| FerranteJason           | https://twitter.com/Pgh311/status/553531058457964544 | Fri Jan 09 12:37:43 +0000 2015 | @FerranteJason We will report possible water leak near @ Bayard &amp; Bellefield Ave with @pgh2o Request ID# 130172. Thank you!                         |
| Brandolph_Trib          | https://twitter.com/Pgh311/status/555005590716821504 | Tue Jan 13 14:16:58 +0000 2015 | @Brandolph_Trib Request ID# 130470 submitted to Permits Office - to confirm  if any permits have been granted...                                        |
| Juliesummer11           | https://twitter.com/Pgh311/status/555018005579845632 | Tue Jan 13 15:06:18 +0000 2015 | @Juliesummer11 Request ID# 130490 submitted to DPW to address sidewalk conditions on Murray Ave Brg b/t Flemington &amp; Morrowfield. Thank you!        |
| vintagepgh              | https://twitter.com/Pgh311/status/555033997223682048 | Tue Jan 13 16:09:51 +0000 2015 | @vintagepgh Thank you! Request ID# 130527 submitted to DPW to address reported icy road conditions in 2000 block of Lautner St.                         |

## Are you a terrible asynchronous programmer?

Absolutely.
