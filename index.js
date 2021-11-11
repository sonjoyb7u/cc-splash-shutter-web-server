const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
// Include Environment Variable ...
require('dotenv').config();
// Connect to Server + React Application(Client) ...
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;
// Used Middleware ...
app.use(cors());
// Data Parser ...
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.eyx6a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Initially Check Server Run ...
app.get('/', (req, res) => {
    res.send("CC Splash Shutter website - Server Running...");
});


async function run() {
    try {
        await client.connect();
        const database = client.db("ccCameraSplashShutter");
        const productsCollection = database.collection("productsCollection")
        console.log("DB connected...");

        app.post('/products/create', async (req, res) => {
            const formData = req.body;
            const create = await productsCollection.insertOne(formData);
            res.json(create)
        });


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)





app.listen(port, () => {
    console.log("Listen & Running App Server port no: ", port);
})