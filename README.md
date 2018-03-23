# SplatBot
Discord bot for scraping and reporting player stats. Since I started streaming Splatoon 2 on Twitch, I wanted to be able to create some hook into my stats so that I could easily report on them in Discord. Eventually I will integrate with Twitch's API.

Running the bot allows for something like the following in Discord:

```
DRLEOSPACEMAN - Today at 6:30 PM
!splat
SplatBotBOT - Today at 6:30 PM
Player:DRSPACEMAN lv.19
--- Current Rankings ---
Clam Blitz: B+
Tower Control: B+
Splat Zones: B+
Rainmaker: B+
```

or

```
DRLEOSPACEMAN - Today at 6:30 PM
!splat-gear
SplatBotBOT - Today at 6:30 PM
Player:DRSPACEMAN lv.19
--- Current Gear ---
 - Weapon: Sploosh-o-matic
    - Sub: Curling Bomb
    - Special: Splashdown

 - Clothes: Crimson Parashooter by Annaki
    - Main Skill: Special Charge Up
    - Sub Skill #1: Cold-Blooded

 - Clothes: Purple Sea Slugs by Tentatek
    - Main Skill: Run Speed Up
    - Sub Skill #1: Cold-Blooded
    - Sub Skill #2: Special Charge Up

 - Clothes: Squidlife Headphones by Forge
    - Main Skill: Ink Recovery Up
    - Sub Skill #1: Cold-Blooded
```

# Next Steps
1. Add in additional message hooks for additional stats (stages, regular play, etc.)
2. Add configurable inputs for the hooks (when it is triggered, output channel, etc.)
3. Add in additional details on weapons/favorites.

# Setup/Installation
It is assumed here that you own/maintain a Discord server.

## Download
1. Download and install [node-js](https://nodejs.org/en/). I went with v8.10.0 LTS (recommended version a the time of this writing).
2. Clone this repo or download as a zip and unzip it somewhere.
3. Open up a command prompt/powershell/terminal and navigate to where you unzipped the source.
4. Run `npm install request discord.js --save`

## Acquiring Your Cookie
1. Follow the directions [here](https://github.com/frozenpandaman/splatnet2statink/wiki/mitmproxy-instructions) to get your iksm_session cookie.
2. Place this cookie in _splatnet_config.json_.

## Add a Bot To Your Discord
1. Follow the directions [here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). Any other source or instructions for adding a bot is fine, I just like this one.
2. Place the bot's token in _auth.json_.

## Running the Bot
1. With the bot added to your Discord, you can now run: `node splatbot.js`. This will print out some indication that a connection was established.
2. Within Discord, type into a text channel that SplatBot has access to: `!splat`. This will provide simple output of your player name, level, and rankings across each competetive mode.

## Configuring
1. You may specify a list of users the bot will listen for in splatbot_config.json. Simply add in users in the format "username#id". Leaving the list empty will allow anyone to trigger SplatBot.