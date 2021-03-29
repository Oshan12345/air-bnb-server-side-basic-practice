const express = require("express");
const app = express();
const port = 4000;
require("dotenv").config();
const cors = require("cors");

var admin = require("firebase-admin");

var serviceAccount = require("./config/air-bnb-clone-9d389-firebase-adminsdk-kjk7f-458af14cbb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rwuce.mongodb.net/air-bnb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db("air-bnb").collection("bookings");
  // perform actions on the collection object
  //console.log("connected to database");
  // client.close();

  //create data in data base
  app.post("/booking", (req, res) => {
    const bookingInfo = req.body;

    collection.insertOne(bookingInfo).then((response) => {
      console.log(response);
      res.send({
        isInserted: response.insertedCount > 0,
        message: "booking successful",
      });
    });
  });

  //read data from data base
  app.get("/get-booking-info", (req, res) => {
    const bearer = req.headers.authorization;
    console.log("token-", bearer);
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ");

      admin
        .auth()
        .verifyIdToken(idToken[1])
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if (tokenEmail === req.query.email) {
            collection
              .find({ email: req.query.email })
              .toArray((err, document) => {
                res.send(document);
                console.log(err);
              });
          } else {
            res.status(401).send("unauthorised access");
          }
        })
        .catch((error) => {
          // Handle error
          res.status(401).send("unauthorised access");
        });
    } else {
      res.status(401).send("unauthorised access");
    }
    console.log(req.query.email);
    // idToken comes from the client app
  });
  console.log("connected to db");
  //end
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
