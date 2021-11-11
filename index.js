const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Running Watch niche website server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spl8q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("watchDb");
    const watchCollection = database.collection("watches");
    const orderCollection = database.collection("orders");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    //get all watch
    app.get("/watches", async (req, res) => {
      const result = await watchCollection.find({}).toArray();
      res.send(result);
    });

    //get particular watch by specific id
    app.get("/watches/:id", async (req, res) => {
      const id = req.params.id;
      const result = await watchCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //post product (watch)
    app.post("/watches", async (req, res) => {
      const watch = req.body;
      const result = await watchCollection.insertOne(watch);
      res.send(result);
    });

    //delete product (watch)
    app.delete("/watches/:id", async (req, res) => {
      const watchId = req.params.id;
      const result = await watchCollection.deleteOne({
        _id: ObjectId(watchId),
      });
      res.send(result);
    });

    //post orders
    app.post("/orders", async (req, res) => {
      const watch = req.body;
      const result = await orderCollection.insertOne(watch);
      res.send(result);
    });

    //get all order
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    //get orders by email id params
    app.get("/orders/:id", async (req, res) => {
      const email = req.params.id;
      const result = await orderCollection.find({ email: email }).toArray();
      res.send(result);
    });

    //delete any order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //update status
    app.put("/orders/:id", async (req, res) => {
      const newStatus = req.body.status;
      const filter = { _id: ObjectId(req.params.id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: newStatus,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //post users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //externally made for google sign in
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //get users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.send(result);
    });

    //get user by email
    app.get("/user/:id", async (req, res) => {
      const email = req.params.id;
      const result = await userCollection.findOne({ email: email });
      res.send(result);
    });

    //post reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //getting all review
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    });

    //getting admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    //role play updating for admin
    // app.put("/users/admin", async (req, res) => {
    //   const user = req.body;
    //   const requester = req.decodedEmail;
    //   const filter = { email: user.email };
    //   const updateDoc = { $set: { role: "admin" } };
    //   const result = await userCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });

    //role play updating for admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const exist = await userCollection.findOne({ email: user.email });
      if (exist) {
        const updateDoc = { $set: { role: "admin" } };
        const resultForExist = await userCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(resultForExist);
      } else {
        const resultForNotExist = await userCollection.insertOne({
          email: user.email,
          role: "admin",
        });
        res.send(resultForNotExist);
      }
    });

    //getting admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening to the port", port);
});
