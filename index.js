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
        const productsCollection = database.collection("productsCollection");
        const ordersCollection = database.collection("ordersCollection");
        const usersCollection = database.collection("usersCollection");
        const reviewsCollection = database.collection("reviewsCollection");

        // console.log("DB connected...");

        // usersCollection.insertOne({
        //     email: "userone@gmail.com",
        //     displayName: "User One",
        //     role: "normal"
        // })

        // Read Users Using GET API
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            console.log(users);
            res.json(users);
        })

        // Create/Save User Using POST API ...
        app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result);
        });

        // Check Update Existing User Using PUT API ...
        app.put('/users', async (req, res) => {         
          const user = req.body;
          const filter = {email: user.email};
          if(filter) {
              const options = { upsert: true };
              const updateDoc = { $set: user };
              const result = await usersCollection.updateOne(filter, updateDoc, options);
            //   res.json(result);
          }
          else {
            const result = await usersCollection.insertOne(user);
            // res.json(result); 
          }

        });

        // User Role Check GET API ...
        // app.get('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = {email: email};
        //     const user = await usersCollection.findOne(query);
        //     res.json(user);
        // });

        // Check User Is Admin Or Not GET API ...
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const findUser = await usersCollection.findOne(query);
            // console.log(findUser);
            // let isAdmin = false;
            // if(findUser?.role === 'admin') {
            //     isAdmin = true;
            // }
            res.json(findUser);
            // res.json({admin: isAdmin});

        });

        // User Role Changing PUT API ...
        app.put("/users/roleChange/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const result = await usersCollection.updateOne(filter, {
                $set: {
                    role: req.body.role,
                }
            });
            console.log(result);
            res.json(result);
        });

        // User Delete DELETE API ...
        app.delete('/users/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await usersCollection.deleteOne(query);
            res.json(destroy);
        });

        // ===================================PRODUCT CRUD=======================================

        // Products Read GET API ...
        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            // console.log(products);
            res.json(products);
        })

        // Product Create POST API ...
        app.post('/products/create', async (req, res) => {
            const formData = req.body;
            console.log(formData);
            const create = await productsCollection.insertOne(formData);
            res.json(create)
        });

        // Product Edit GET API ...
        app.get('/products/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const product = await productsCollection.findOne(query);
            // console.log(product[0]);
            res.json(product);
        });

        // Product Update PUT API ... 
        app.put('/products/update/:id', async (req, res) => {
            const id = req.params.id;
            const editFormData = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: editFormData.title,
                    price: editFormData.price,
                    packagePrice: editFormData.packagePrice,
                    rating: editFormData.rating,
                    manufacturer: editFormData.manufacturer,
                    madeBy: editFormData.madeBy,
                    shortDesc: editFormData.shortDesc,
                    imageUrl: editFormData.imageUrl,
                    longDesc: editFormData.longDesc,
                    key: editFormData.key,
                    updatedAt: editFormData.updatedAt
                }
            };
            const update = await productsCollection.updateOne(filter, updateDoc, options);
            console.log(update);
            res.json(update);
        });

        // Product Delete DELETE API ...
        app.delete('/products/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await productsCollection.deleteOne(query);
            res.json(destroy);
        });

        // Show Product Detail GET API ... 
        app.get('/product-detail/:id', async (req, res) => {
            const query = {_id: ObjectId(req.params.id)};
            const product = await productsCollection.findOne(query);
            // console.log(product);
            res.json(product)
        });

        // ====================================================================================

        // Guest User Order Create POST API ... 
        app.post('/orders/create', async (req, res) => {
            const formData = req.body;
            const create = await ordersCollection.insertOne(formData);
            res.json(create);
        });

        // Guest User Read Personal/My Orders GET API ...
        app.get("/user/myOrders/:email", async (req, res) => {
            console.log(req.params.email);
            const email = { email: req.params.email }
            const result = await ordersCollection.find(email).toArray();
            res.json(result);
        });

        // Guest User Delete Order DELETE API ... 
        app.delete('/user/myOrder/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await ordersCollection.deleteOne(query);
            res.json(destroy);
        });


        // =============================REVIEW CRUD==============================
        // Guest User Create Review POST API ...
        app.post('/user/review/create', async (req, res) => {
            const formData = req.body;
            const create = await reviewsCollection.insertOne(formData);
            res.json(create);
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