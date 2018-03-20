// Modules
var request = require('request');
var Discord = require('discord.js');

// Configuration
var auth = require('./auth.json');
var splat = require('./splatnet_config.json')

// Configure request
var jar = request.jar();
var cookie = request.cookie('iksm_session='+ splat.cookie);
jar.setCookie(cookie, 'https://app.splatoon2.nintendo.net/api/records');

// Options for the request
var options = {
	url: 'https://app.splatoon2.nintendo.net/api/records',
   method: 'get',
   jar: jar
};

// Callback when a "!splat" is triggered.
function get_splat_data(msg) {
    request(options, function (error, response, body) {
        if (error) {
            console.log(response.statuscode)
            console.log(error)
        }
        else {
            var json = JSON.parse(body);
            var report = "";
            report += 'Player:' + json['records']['player']['nickname'] + ' lv.' + json['records']['player']['player_rank'] + '\n';
            report += '--- Current Rankings ---\n'
            report += "Clam Blitz: " + json['records']['player']['udemae_clam']['name'] + '\n';
            report += "Tower Control: " + json['records']['player']['udemae_tower']['name'] + '\n';
            report += "Splat Zones: " + json['records']['player']['udemae_zones']['name'] + '\n';
            report += "Rainmaker: " + json['records']['player']['udemae_rainmaker']['name'] + '\n';
            msg.channel.send(report);
        }
    });
}

// Initialize Discord Bot
var bot = new Discord.Client();

// Log-on confirmation
bot.on('ready', () => {
    console.log('Connected');
    console.log(`Logged in as ${bot.user.tag}!`);
});

// Message hook
bot.on('message', msg => {
    if (msg.content === '!splat') {
       get_splat_data(msg);
    }
});

// Login
bot.login(auth.token);