const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//.............................. middleWare...............................
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kw08h9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const courcesDB = client.db("courcesDB");
    const ordersDB = client.db("ordersDB");
    const userDB = client.db("userDB");
    const coursesCollection = courcesDB.collection("coursesCollection");
    const ordersCollection = ordersDB.collection("ordersCollection");
    const userCollection = userDB.collection("userCollection");

    // all course related data
    app.post("/courses", async (req, res) => {
      const courseData = req.body;
      const result = await coursesCollection.insertOne(courseData);
      res.send(result);
    });
    app.get("/courses", async (req, res) => {
      const courseData = coursesCollection.find();
      const result = await courseData.toArray();
      res.send(result);
    });

    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const courseData = await coursesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(courseData);
    });

    app.patch("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await coursesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.delete("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const result = await coursesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // all orders related data
    app.get("/orders", async (req, res) => {
      console.log(req.query);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/orders", async (req, res) => {
      const ordersData = req.body;
      const result = await ordersCollection.insertOne(ordersData);
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          statu: "success",
          message: "Login success",
        });
      }
      const result = await userCollection.insertOne(user);
      return res.send(result);
    });

    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await userCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running on 5000");
});

app.listen(port, () => {
  console.log(`server is running on:${port}`);
});
