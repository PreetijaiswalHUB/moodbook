const express = require("express");
const request = require('request');
const path = require("path");
// var ObjectId = require('mongodb').ObjectID;

const bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
const EventEmitter = require("events"); //EventEmitter is the class being imported
const {
  get
} = require("http");
const eventemitter = new EventEmitter();
var email;
var name;

var url = "mongodb+srv://pansy:ola123@cluster0.dw8ck.mongodb.net/pansy&w=majority"
const app = express();


app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.urlencoded({
  extended: true
}));

let tweetsArray = [];
let userId = "";

// app.get('/sendtweet', function(req, res) {

// request({
//   method: 'POST',
//   url: 'http://127.0.0.1:5000/',
//   // body: '{"foo": "bar"}'
//   json: {"foo": "bar"}
// }, (error, response, body) => {
//   console.log(error);
//   // console.log(response);
//   console.log(body);
// });
// });


// app.get('/home', function(req, res) {

//   request('http://127.0.0.1:5000/flask', function (error, response, body) {
//       console.error('error:', error); // Print the error
//       console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//       console.log('body:', body); // Print the data received
//       res.send(body); //Display the response on the website
//     });   

// });

app.post("/index", (req, res) => {
  // console.log(req)
  // for (i = 0; i < 400; i++) {
  //   productsArray[i] = 0;
  // }


  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let session = "0";
  let totalTweet = 0;
  let negativeTweet = 0;
  var userobj = {
    name: name,
    email: email,
    password: password,
    session: session,
    negativeTweet: negativeTweet,
    totalTweet: totalTweet
  };
  console.log(userobj);

  MongoClient.connect(url, {
    useUnifiedTopology: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pansy&w=majority");
    var que = {
      email: email
    }
    console.log(que)
    dbo.collection("userInfo").find(que).toArray(function (err, result) {
      if (err) throw err;
      if (result.length < 1) {

        console.log(result.length)

        MongoClient.connect(url, {
          useUnifiedTopology: true
        }, function (err, db) {
          if (err) throw err;
          var dbo = db.db("pansy&w=majority");
          dbo.collection("userInfo").insertOne(userobj, (err, res) => {
            if (err) throw err;
            console.log("user object inserted");
            db.close();
          });
        });

        res.redirect("/index.html");

      } else {
        // console.log(result)
        res.redirect("emailExist.html")
      }
    });
  });

});
app.post("/check", (req, res) => {

  let uemail = req.body.email;
  let upass = req.body.pass;
  console.log(uemail, upass);

  MongoClient.connect(url, {
    useUnifiedTopology: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pansy&w=majority");

    var query = {
      $and: [{
        email: uemail
      }, {
        password: upass
      }],
    };

    dbo
      .collection("userInfo")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("result:", result);
        if (result.length > 0) {
          if (result[0].session == "0") {
            sessionFlag = 0;
            // eventemitter.emit("get_email", uemail);
            console.log("verified");
            name = result[0].name
            email = uemail;
            userId = result[0]._id;
            //cartContents = result[0].cart;
            //cartNum = result[0].cartNumber;
            //cartTot = result[0].cartTotal;
            tweetsArray = result[0].tweetsArray;
            //summaryContents = result[0].summary;
            //idnoArray = result[0].idArray;
            sess = "1";

            //console.log(prodArray);

            // console.log(name);
            console.log(result);
            console.log(result[0].name);


            res.redirect("/landingPage.html");
            console.log(`email is ${uemail}`);
          } else {
            res.redirect("sessionActive.html")
          }

        } else {
          console.log("Login Failed");
          res.redirect("/loginFailed.html");
        }

        var query = {
          $and: [{
            email: uemail
          }, {
            password: upass
          }],
        };

        var newvalues = {
          $set: {
            session: "0"
          }
        };
        dbo.collection("userInfo").updateOne(query, newvalues, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");

        });
      });
  });
});

app.get("/get_sess", (req, res) => {
  console.log(sess);
  res.send(sess);
  sess = "0"
});
app.get("/get_userid", (req, res) => {
  console.log(userId);
  res.send(userId);
});
app.get("/get_email", (req, res) => {
  console.log(email);
  res.send(email);
  email = "";
});

app.get("/get_name", (req, res) => {
  console.log(name);
  res.send(name);
  name = "";
});

app.get("/get_tweets_array", (req, res) => {
  console.log(tweetsArray);
  res.send(tweetsArray);
  // tweetsArray=[];
});
app.post("/add_post", (req, res) => {

  var userObj = req.body;
  console.log(userObj);
  console.log(JSON.stringify(Object.values(userObj)[0]));
  console.log(JSON.stringify(Object.values(userObj)[1]));
  console.log(JSON.stringify(Object.values(userObj)[2]));

  var tweetData = JSON.stringify(Object.values(userObj)[0]);
  var user_id = JSON.stringify(Object.values(userObj)[1]);
  var user_name = JSON.stringify(Object.values(userObj)[2]);

  request({
    method: 'POST',
    url: 'http://127.0.0.1:5000/',
    // body: '{"foo": "bar"}'
    json: { "tweetData": tweetData }
  }, (error, response, body) => {
    console.log(error);
    // console.log(response);
    console.log("body", body);
  });
  request('http://127.0.0.1:5000/flask', function (error, response, body) {
    console.error('error:', error); // Print the error
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the data received
    var tweetValue = body;
    // if(body==0)
    //   var tweetValue = ;
    // else if(body==1)
    //   tweetValue=0;
    var userObj = {
      tweetData: JSON.parse(tweetData),
      user_id: user_id,
      user_name: user_name,
      tweetValue: tweetValue,
    };
    MongoClient.connect(url, {
      useUnifiedTopology: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("pansy&w=majority");
      dbo.collection("tweets").insertOne(userObj, (err, res) => {
        if (err) throw err;
        console.log("user object inserted");
        db.close();
      });

    });
    MongoClient.connect(url, {
      useUnifiedTopology: true
    }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("pansy&w=majority");
      uname = user_name.slice(0, user_name.length - 2) + "\"";
      console.log(uname);
      console.log("user: ", uname);
      let query = { name: uname };

      dbo.collection("userInfo").findOneAndUpdate(
        query,
        { $inc: { totalTweet: 1 } },
        (err, userInfo) => {    // callback
          console.log("ll", userInfo);
        }
      )

    });

    // res.send(body); //Display the response on the website
  });

});

app.get("/get_tweets", (req, res) => {
  //res.json({test:123});
  MongoClient.connect(url, {
    useUnifiedTopology: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pansy&w=majority");
    dbo
      .collection("tweets")
      .find()
      .toArray((err, res) => {
        tweets = [...res];

        // console.log(tweets);

        db.close();
      });
    //     .toArray((err, res) => {
    //       tweets = [...res];

    //        //console.log(tweets);

    //       db.close();
    //     });
  });
  setTimeout(() => {
    res.json(tweets);
  }, 2000);
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log("server running on port 3001");
});
