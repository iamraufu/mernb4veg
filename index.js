const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const dbUserName = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbServer = process.env.DB_SERVER;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = `mongodb+srv://${dbUserName}:${dbPassword}@${dbServer}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

client.connect((err) => {
  // const usersCollection = client.db("mernb4").collection("users");
  const vegsCollection = client.db("mernb4vegstore").collection("veg");

  // CRUD => Create, Read, Update, Delete

  // Create (Add to DB)
  app.post("/addVeg", (req, res) => {
    const veg = req.body;
    vegsCollection.insertOne(veg).then((result) => {
      result.acknowledged && res.redirect("/");
    });
  });

  // GET
  app.get("/vegetables", (req, res) => {
    vegsCollection.find({}).toArray((err, veg) => {
      err && console.log(err);
      res.send(veg);
    });
  });

  // GET
  app.get("/vegetables/:id", (req, res) => {
    const id = ObjectId(req.params.id);

    vegsCollection.find({ _id: id }).toArray((err, veg) => {
      err && console.log(err);
      res.send(veg[0]);
    });
  });

  // Update (PATCH)
  app.patch("/vegetable/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    const name = req.body.name;
    const price = req.body.price;
    const quantity = req.body.quantity;

    vegsCollection
      .updateOne(
        {
          _id: id,
        },
        {
          $set: {
            name,
            price,
            quantity,
          },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });

  // Delete Veg
  app.delete("/vegetable/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    vegsCollection
      .deleteOne({ _id: id })
      .then(
        (result) => result.acknowledged && res.send(result.deletedCount > 0)
      );
  });

  err
    ? console.log("MongoDB Connection Failed")
    : console.log("Connected to MongoDB");
});

app.listen(port, () => {
  console.log(`My First Express app listening on port ${port}`);
});
