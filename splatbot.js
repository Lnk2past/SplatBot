// Modules
var request = require('request');
var Discord = require('discord.js');

// Configuration
var auth = require('./auth.json');
var config = require('./splatbot_config.json');
var splat = require('./splatnet_config.json');

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

// Utility function for reading gear data and putting into a report
function read_gear(player, gear_type) {
    gear_report = ''
    gear = player[gear_type];
    gear_skills = player[gear_type+'_skills'];
    gear_report += ' - ' + gear_type + ': ' + gear['name'] + ' by ' + gear['brand']['name'] + '\n';
    gear_report += '    - Main Skill: ' + gear_skills['main']['name'] + '\n'
    var counter = 1;
    for (var sub_idx in gear_skills['subs']) {
        var sub = gear_skills['subs'][sub_idx];
        if (sub != null) {
            gear_report += '    - Sub Skill #' + counter + ': ' + sub['name'] + '\n';
            counter++;
        }
    }
    gear_report += '\n';
    return gear_report;
}

// Callback when a '!splat' is triggered
function get_splat_data(msg) {
    request(options, function (error, response, body) {
        if (error) {
            console.log(response.statuscode);
            console.log(error);
        }
        else {
            var json = JSON.parse(body);
            var player = json['records']['player']
            var report = '```';
            report += 'Player:' + player['nickname'] + ' lv.' + player['player_rank'] + '\n';
            report += '--- Current Rankings ---\n'
            report += ' - Clam Blitz: ' + player['udemae_clam']['name'] + '\n';
            report += ' - Tower Control: ' + player['udemae_tower']['name'] + '\n';
            report += ' - Splat Zones: ' + player['udemae_zones']['name'] + '\n';
            report += ' - Rainmaker: ' + player['udemae_rainmaker']['name'] + '\n';
            report += '```'
            msg.channel.send(report);
        }
    });
}

// Callback when a '!splat-gear' is triggered
function get_splat_gear_data(msg) {
    request(options, function (error, response, body) {
        if (error) {
            console.log(response.statuscode);
            console.log(error);
        }
        else {
            var json = JSON.parse(body);
            var player = json['records']['player'];
            var report = '```';
            report += 'Player:' + player['nickname'] + ' lv.' + player['player_rank'] + '\n';
            report += '--- Current Gear ---\n'

            weapon = player['weapon']
            report += ' - Weapon: ' + weapon['name'] + '\n';
            report += '    - Sub: ' + weapon['sub']['name'] + '\n';
            report += '    - Special: ' + weapon['special']['name'] + '\n\n';

            report += read_gear(player, 'clothes');
            report += read_gear(player, 'shoes');
            report += read_gear(player, 'head');

            report += '```';

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
    // Report if the message author is listed or if there are no listed listeners

    author = msg.author.username + '#' + msg.author.discriminator;
    console.log(author);

    if (config.listen_to.length == 0 || config.listen_to.includes(author)) {
        if (msg.content == '!splat') {
            get_splat_data(msg);
        }

        if (msg.content == '!splat-gear') {
            get_splat_gear_data(msg);
        }
    }
});

// Login
bot.login(auth.token);