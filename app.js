//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

const MongoClient = require('mongodb').MongoClient;
const dbName = 'wikiDB';
const myCollection = "articles";
const url1 = "mongodb://localhost:27017"; //connect to local mongodb
const url2 = "mongodb+srv://admin-mj:Test123@cluster0-kou5b.mongodb.net/"; //connecto mongodb Atlas
const client = new MongoClient(url1, {
  useNewUrlParser: true
});
const connect = client.connect(); // initialized connection

app.route("/articles")
  .get(
    function(req, res) {
      connect.then(() => {
        const db = client.db(dbName);
        db.collection(myCollection).find({}).toArray(function(err, results) {
          res.render("results", {
            results: results
          });
        });
      });
    }
  )
  .post(
    function(req, res) {
      connect.then(() => {
        const db = client.db(dbName);
        const doc = {
          title: req.body.title,
          content: req.body.content
        };
        db.collection(myCollection).insertOne(doc)
          .then(function(result) {
            res.render("success", {
              doc: doc
            });
          })
          .catch(function(err) {
            res.send("Failed. Error mesg: " + err);
          });
      });
    }
  )
  .delete(
    function(req, res) {
      connect.then(() => {
        const db = client.db(dbName);
        db.collection(myCollection).deleteMany({})
          .then(function(result) {
            res.send("Success! " + result.deletedCount + " docs were deleted");
          })
          .catch(function(err) {
            res.send("Failed. Error mesg: " + err);
          });
      });
    }
  );

app.route("/articles/:article")
  .get(function(req, res) {
    const article = req.params.article;
    connect.then(() => {
      const db = client.db(dbName);
      db.collection(myCollection).find({
        "title": article
      }).toArray(function(err, results) {
        if (!err && results.length > 0) {
          res.render("results", {
            results: results
          });
        } else {
          res.send("No articles title: " + article + " was found");
        }
      });

    });
  })
  .put(function(req, res) {
    const article = req.params.article;
    connect.then(() => {
      const db = client.db(dbName);
      db.collection(myCollection).updateMany(
        {title: article},
       {$set: {"title": req.body.title, "content": req.body.content}},
       {upsert: true},
        function(mesg1, mesg2, mesg3) {
          res.send(mesg1 + " , " + mesg2 + " , " + mesg3);
        }
      );
    });
  })
  .patch(function(req, res) {
    const article = req.params.article;
    console.log(req.body);
    connect.then(() => {
      const db = client.db(dbName);
      db.collection(myCollection).updateMany(
       {title: article},
       {$set: req.body},
        function(mesg1, mesg2) {
          res.send(mesg1 + " , " + mesg2 + " , ");
        }
      );
    });
  })
  .delete(function(req, res) {
    const article = req.params.article;
    connect.then(() => {
      const db = client.db(dbName);
      db.collection(myCollection).deleteMany(
       {title: article},
        function(mesg1, mesg2, mesg3) {
          res.send(mesg1 + " , " + mesg2 + " , " + mesg3);
        }
      );
    });
  });


app.route("/success")
  .get(
    function(req, res) {
      res.render("success");
    }

  );


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
