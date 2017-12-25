var Discord = require('discord.io');
var bodyParser = require('body-parser');
var express = require('express');
var JsonDB = require('node-json-db');
var db = new JsonDB("myDataBase", true, false);
var app = express();
var bot = new Discord.Client({
    token: "null",
    autorun: true
});

app.use(bodyParser.json());

var channel_ID = "231341818350927872"; //Default channel ID when bot started, can be changed with '!ST' command

app.post('/github', function (req, res) {
    if (req.headers['x-github-event'] == "push")
    {
      var branch = req.body.ref;
      branch = branch.replace("refs/heads/","");
    	bot.sendMessage({
                to: channel_ID,
                message: "New commit by: **" + req.body.pusher.name + "**\n\n" +
                "[**"+ req.body.repository.full_name +"** => **" + branch + "**]\nCommit message: **" + req.body.head_commit.message + "** \n" + req.body.head_commit.url + "\n\n"
    	});
    	res.end('Notification send');
    }
    else if (req.headers['x-github-event'] == "issues")
    {
      if (req.body.action == "edited")
      {
        bot.sendMessage({
            to: channel_ID,
            message: "Issue edited !\n\n" +
            "Title: **" + req.body.issue.title + "** \n" +
            "State: **" + req.body.issue.state + "** \n" +
            "Opened by: **" + req.body.issue.user.login + "**\n" +
            "\n\n" + req.body.issue.html_url + "\n\n"
        });
        res.end('Notification send');
      }
      else if (req.body.action == "opened")
      {
        bot.sendMessage({
            to: channel_ID,
            message: "New issue !\n\n" +
            "Title: **" + req.body.issue.title + "** \n" +
            "State: **" + req.body.issue.state + "** \n" +
            "Opened by: **" + req.body.issue.user.login + "**\n" +
            "Message:\n `` " + req.body.issue.body + " `` \n\n" + req.body.issue.html_url + "\n\n"
        });
        res.end('Notification send');
      }
      else if (req.body.action == "created")
      {
        bot.sendMessage({
            to: channel_ID,
            message: "New message on issue : " + req.body.issue.title + "\n\n" +
            "State: **" + req.body.issue.state + "** \n" +
            "Opened by: **" + req.body.issue.user.login + "**\n" +
            "Send by ** " + req.body.comment.user.login + "**\n" +
            "Message:\n `` " + req.body.issue.body + " `` \n\n" + req.body.comment.html_url + "\n\n"
        });
        res.end('Notification send');
      }
      else
      {
        bot.sendMessage({
            to: channel_ID,
            message: "Issue Notification !\n\n" +
            "Title: **" + req.body.issue.title + "** \n" +
            "State: **" + req.body.issue.state + "** \n" +
            "Opened by: **" + req.body.issue.user.login + "**\n" +
            "\n\n" + req.body.issue.html_url + "\n\n"
        });
        res.end('Notification send');
      }

    }
});

bot.on('ready', function() {
    console.log(bot.username + " - (" + bot.id + ")");
});

bot.on('message', function(user, userID, channelID, message, event) {

    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }

    if (message[0] == '!') {

      var messages = message.split(' ');

      switch (messages[0]) {
        case "!help":
          bot.sendMessage({
            to: channelID,
            message: "Help of GitHub Bot by MrDarkSkil:\n\n" +
            "**!help** : show help\n" +
            "**!set** : set the current channel to the default notification channel\n" +
            "**!list** : show all available commands.\n" +
            '**!add** "{question}" "{response}" : add an {response} to a specific {question}\n' +
            '**!remove** "{question}" : remove a specific {question}\n\n\n'+
            "Developped by MrDarkSkil with :heartpulse:\n" +
            "Follow me on GitHub :smile: https://github.com/MrDarkSkil/"
          });
          break;
        case "!set":
          if (channel_ID == channelID)
          {
            bot.sendMessage({
              to: channelID,
              message: "This channel is allready the default channel :no_entry_sign: "
            });
          }
          else
          {
            bot.sendMessage({
              to: channelID,
              message: "Channel successfully changed"
            });
            channel_ID = channelID;
            bot.sendMessage({
              to: channelID,
              message: "This channel is now the default notification channel :ok_hand: "
            });
          }
          break;
        case "!add":
          var argv = new Array();

          argv[1] = message.split('"')[1];
          argv[2] = message.split('"')[3];

          if (argv[1] != null && argv[2] != null)
          {
            bot.sendMessage({
                to: channelID,
                message: "Response to '"+ argv[1] +"' added",
            });
            db.push("/responses/" + argv[1], argv[2]);
          }
          else
          {
            bot.sendMessage({
                to: channelID,
                message: 'Error: !add "{question}" "{response}" ',
            });
          }
          break;
        case "!remove":
          var argv = new Array();

          argv[1] = message.split('"')[1];
          if (argv[1] != null)
          {
            try {
              var question = db.getData("/responses/" + argv[1]);
              if (question != null)
              {
                db.delete('/responses/' + argv[1])
                bot.sendMessage({
                    to: channelID,
                    message: argv[1] +' question\'s removed',
                });
              }
            } catch (e) {
              bot.sendMessage({
                  to: channelID,
                  message: "This question ``" + argv[1] + "`` does't exist !" ,
              });
            }

          }
          else {
            bot.sendMessage({
                to: channelID,
                message: 'Error: !remove "{question}"',
            });
          }
          break;
        case "!list":

          var data = db.getData("/responses");

          for(var item in data ) {
            bot.sendMessage({
                to: channelID,
                message: item
            });
          }

          return;
          data.map(function(i){
            bot.sendMessage({
                to: channelID,
                message: i
            });
          });
          break;
        default:
          bot.sendMessage({
            to: channelID,
            message: "Command not found"
          });
          break;
      }
    }

    try {
      var question = db.getData("/responses/" + message);
      if (question != null)
      {
        bot.sendMessage({
            to: channelID,
            message: question
        });
      }
    } catch (e) {

    }

});

app.listen(8000);
