require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

const port = 5000;

const userName = process.env.DB_USER;
const pass = process.env.DB_PASS;
const database = process.env.DB_NAME;
const collectionProducts = process.env.DB_COLLECTION_PRODUCTS;
const collectionOrders = process.env.DB_COLLECTION_ORDERS;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${userName}:${pass}@cluster0.twaro.mongodb.net/${database}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const productsCollection = client.db(database).collection(collectionProducts);
  const ordersCollection = client.db(database).collection(collectionOrders);
  console.log(`Database connected`);

  app.post("/addProduct", (req, res) => {
    const products = req.body;
    productsCollection.insertOne(products).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/products", (req, res) => {
    productsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/product/:key", (req, res) => {
    productsCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/productsByKeys", (req, res) => {
    const productKeys = req.body;
    productsCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
