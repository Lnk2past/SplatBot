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

// Random Phrases
cool_phrases = ['Sashimi rollin, they hatin!',
                'Who be that fish?!',
                'New squid on the block!',
                'You are inkredible!',
                'Summon the Kraken!',
                'It is always sunny in Squidadelphia!',
                'You are tentacool!',
                'There is a method to my splatness...',
                'Oops, I squid it again!',
                'Daaaamn you are krillin it!'];

// Utility function for getting a cool phrase
function get_cool_phrase() {
    idx = Math.floor(Math.random() * cool_phrases.length);
    return cool_phrases[idx];
}

// Utility function for request callbacks
function splat_request(callback) {
    request(options, function (error, response, body) {
        if (error) {
            console.log(response.statuscode);
            console.log(error);
        }
        else {
            var json = JSON.parse(body);
            callback(json);
        }
    });
}

// Utility function for grabbing player ranks
function read_splat_ranks(player) {
    var ranks = {'player': player['player_rank'],
                 'Clam Blitz': [player['udemae_clam']['name'], player['udemae_clam']['s_plus_number']],
                 'Tower Control': [player['udemae_tower']['name'], player['udemae_tower']['s_plus_number']],
                 'Splat Zones': [player['udemae_zones']['name'], player['udemae_zones']['s_plus_number']],
                 'Rainmaker': [player['udemae_rainmaker']['name'], player['udemae_rainmaker']['s_plus_number']]};
    return ranks;
}

// Utility function for reading gear data and putting into a report
function read_gear(player, gear_type) {
    gear_report = ''
    gear = player[gear_type];
    gear_skills = player[gear_type+'_skills'];
    gear_report += ' - ' + gear_type + ': ' + gear['name'] + ' by ' + gear['brand']['name'] + '\n';
    gear_report += '    - main skill: ' + gear_skills['main']['name'] + '\n'
    var counter = 1;
    for (var sub_idx in gear_skills['subs']) {
        var sub = gear_skills['subs'][sub_idx];
        if (sub != null) {
            gear_report += '    - sub skill #' + counter + ': ' + sub['name'] + '\n';
            counter++;
        }
    }
    gear_report += '\n';
    return gear_report;
}

// Callback when a '!splat' is triggered
function get_splat_data(channel) {
    splat_request(function (json) {
        var player = json['records']['player']
        var ranks = read_splat_ranks(player);
        var report = '```';
        report += 'Player:' + player['nickname'] + ' lv.' + ranks['player'] + '\n';
        report += '--- Current Rankings ---\n'
        report += ' - Clam Blitz: ' + ranks['Clam Blitz'] + '\n';
        report += ' - Tower Control: ' + ranks['Tower Control'] + '\n';
        report += ' - Splat Zones: ' + ranks['Splat Zones'] + '\n';
        report += ' - Rainmaker: ' + ranks['Rainmaker'] + '\n';
        report += '```'
        channel.send(report);
    });
}

// Callback when a '!splat-gear' is triggered
function get_splat_gear_data(channel) {
    splat_request(function (json) {
        var player = json['records']['player'];
        var report = '```';
        report += 'Player:' + player['nickname'] + ' - rank.' + player['player_rank'] + '\n';
        report += '--- Current Gear ---\n'
        weapon = player['weapon']
        report += ' - weapon: ' + weapon['name'] + '\n';
        report += '    - sub: ' + weapon['sub']['name'] + '\n';
        report += '    - special: ' + weapon['special']['name'] + '\n\n';
        report += read_gear(player, 'clothes');
        report += read_gear(player, 'shoes');
        report += read_gear(player, 'head');
        report += '```';
        channel.send(report);
    });
}

// Callback for monitoring ranks
function monitor_splat_ranks(channel) {
    if (typeof monitor_splat_ranks.ranks == 'undefined') {
        monitor_splat_ranks.ranks = new Map();
    }

    function check_mode_ranks(mode, old_ranks, new_ranks) {
        var [old_rank, old_s] = old_ranks[mode];
        var [new_rank, new_s] = new_ranks[mode];
        if (old_rank == new_rank && old_s == new_s) {
            return;
        }
        if (old_rank[0] > new_rank[0] || 
            (old_rank[0] < new_rank[0] && ['S', 'X'].includes(new_rank[0])) ||
            (old_s != null && new_s > old_s) ||
            (old_rank[0] == new_rank[0] && old_rank[1] == '-' && new_rank.length == 1 ) ||
            (old_rank[0] == new_rank[0] && new_rank[1] == '+' && old_rank.length == 1 )) {
            var report = '```css\n'
            report += get_cool_phrase() + '\n';
            report += mode + ' rank up! Now splattin at ' + new_rank;
            if (new_s != null) {
                report += new_s;
            }
            report += '```'
            channel.send(report);
        }
    }

    splat_request(function (json) {
        var player = json['records']['player'];
        var ranks = read_splat_ranks(player);
        if ('player' in monitor_splat_ranks.ranks) {
            // Check player rank
            if (ranks['player'] > monitor_splat_ranks.ranks['player']) {
                var report = '```css\n';
                report += get_cool_phrase() + '\n';
                report += 'Player rank up! Now splattin at ' + ranks['player'] + '\n';
                report += '```'
                channel.send(report);
            }
            // Check mode ranks
            check_mode_ranks('Clam Blitz', monitor_splat_ranks.ranks, ranks);
            check_mode_ranks('Tower Control', monitor_splat_ranks.ranks, ranks);
            check_mode_ranks('Splat Zones', monitor_splat_ranks.ranks, ranks);
            check_mode_ranks('Rainmaker', monitor_splat_ranks.ranks, ranks);
        }
        monitor_splat_ranks.ranks = ranks;
    });
}

// Initialize Discord Bot
var bot = new Discord.Client();
var monitoring_enabled = false;
var monitoring_interval = null;

// Log-on confirmation
bot.on('ready', () => {
    console.log('Connected');
    console.log(`Logged in as ${bot.user.tag}!`);
});

// Message hook
bot.on('message', msg => {
    // Report if the message author is listed or if there are no listed listeners
    author = msg.author.username + '#' + msg.author.discriminator;
    if (config.listen_to.length == 0 || config.listen_to.includes(author)) {
        if (msg.content == '!splat') {
            get_splat_data(msg.channel);
        }
        else if (msg.content == '!splat-gear') {
            get_splat_gear_data(msg.channel);
        }
        else if (msg.content == '!splat-monitor' && !monitoring_enabled) {
            monitoring_enabled = true;
            monitoring_interval = bot.setInterval(function () {
                monitor_splat_ranks(msg.channel);
            }, 1 * 10000); 
        }
        else if (msg.content == '!splat-monitor' && monitoring_enabled) {
            monitoring_enabled = false;
            bot.clearInterval(monitoring_interval);
        }
    }
});

// Login
bot.login(auth.token);