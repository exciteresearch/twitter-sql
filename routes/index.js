var express = require('express');
var router = express.Router();
//var tweetBank = require('../tweetBank');
module.exports = router;
var User = require('../models').User;
var Tweet = require('../models').Tweet;

function createTweetsObj(tweetId, tweetName, tweetText, pictureUrl){
    return {id:tweetId,
            name: tweetName,
            text:tweetText,
            pictureUrl: pictureUrl
        };
}

router.get('/', function (req, res) {
    User.findAll({ include: [ Tweet ] }).then(function(users){
        var tweets = [];
        // for(var i = 0; i < users.length; i++){
        //     tweets.push(createTweetsObj(users[i].id, users[i].name, users[i].Tweets[0].tweet));
        // }
        users.forEach(function(users){ //keys().
           tweets.push(createTweetsObj(users.id, users.name, users.Tweets[0].tweet, users.pictureUrl));
        });
        res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true
        });
    });
});

router.get('/users/:name', function (req, res) {
    var name = req.params.name;
    User.find({ where: {name: name} }).complete(function(err, user) {
        user.getTweets().complete(function(err, tweets) {
            res.render('index', {
            title: 'Twitter.js - Posts by ' + name,
            tweets: [createTweetsObj(tweets[0].dataValues.id, name, tweets[0].dataValues.tweet)],
            showForm: true
        });
      });
    });
});


router.get('/users/:name/tweets/:id', function (req, res) {
    var name = req.params.name;
    var id = parseInt(req.params.id);
    var tweets = [];
    User.find({ where: {name: name, id:id} }).complete(function(err, user) {
        user.getTweets().complete(function(err, tweets) {
            res.render('index', {
            title: 'Twitter.js - Tweet by ' + name,
            tweets: [createTweetsObj(id, name, tweets[0].dataValues.tweet)],
            showForm: true
            });
        });
    });
    
});

// router.post('/submit', function(req, res) {
//     var name = req.body.name;
//     var text = req.body.text;
//     tweetBank.add(name, text);
//     io.sockets.emit('new_tweet', { /* tweet info */ });
//     res.redirect('/');
// });

router.post('/submit', function(req, res) {
    var name = req.body.name;
    var text = req.body.text;
    //tweetBank.add(name, text);
    User.find( { where: { name: name } }).complete(function(err, user){
        if (user===null) {console.log("err",err);
            User.create( { name: name, pictureUrl: null}).then(function(result){
            console.log("result",result,"result.dataValues.id", result.dataValues.id,"typeof",typeof result.dataValues.id);
            Tweet.create( { UserId: result.dataValues.id, tweet: text }).then(function(tweetResult){console.log('tweetResult', tweetResult);});
        });
            
        }
        else {console.log("user",user);
            Tweet.create( { UserId: user.dataValues.id, tweet: text }).then(function(tweetResult){console.log('tweetResult', tweetResult);});
     
        }
    });
    
    //io.sockets.emit('new_tweet', { /* tweet info */ }); //what does emit do again?
    res.redirect('/');
});