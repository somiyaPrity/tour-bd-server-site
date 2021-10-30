const { MongoClient } = require('mongodb');
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhf79.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('tourDatabase');
    const packagesCollection = database.collection('packages');
    const orderCollection = database.collection('orders');

    // get api
    app.get('/packages', async (req, res) => {
      console.log('running');
      const cursor = packagesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // post api
    app.post('/packages', async (req, res) => {
      const item = req.body;
      const result = await packagesCollection.insertOne(item);
      res.json(result);
    });
    // post order api
    app.post('/order', async (req, res) => {
      const item = req.body;
      const result = await orderCollection.insertOne(item);
      res.json(result);
    });
    // get all order data
    app.get('/order', async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });
    // get order data based on email
    app.get('/order/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // update order status
    app.put('/order/:id', async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const filter = {
        _id: ObjectId(id),
      };
      const doc = {
        $set: {
          status: updatedStatus.status,
        },
      };
      const result = await orderCollection.updateOne(filter, doc);

      res.json(result);
    });
    // delete an order
    app.delete('/order/:id', async (req, res) => {
      console.log(req.params.id);
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

console.log(uri);
app.get('/', (req, res) => {
  res.send('Hello Heroku');
});

app.listen(port, () => {
  console.log('server is running');
});
