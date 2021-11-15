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

// https://pure-castle-02044.herokuapp.com/

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
        const productWiseReviewsCollection = database.collection("productWiseReviewsCollection");

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
            // console.log(users);
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
          let result = [];
          if(filter) {
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const updateUser = await usersCollection.updateOne(filter, updateDoc, options);
            result.push(updateUser);
          }
          else {
            const newUser = await usersCollection.insertOne(user);
            result.push(newUser)
          }
        //   res.json(result); 

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
            const userRoleAdmin = await usersCollection.findOne(query);
            // console.log(findUser);
            // let isAdmin = false;
            // if(userRoleAdmin?.role === 'admin') {
            //     isAdmin = true;
            // }
            res.json(userRoleAdmin);
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
            // console.log(result);
            res.json(result);
        });

        // User Delete DELETE API ...
        app.delete('/users/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await usersCollection.deleteOne(query);
            res.json(destroy);
        });

        // ===================================ADMIN PRODUCT CRUD=======================================

        // Admin User All Products Read GET API ...
        app.get('/admins/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            // console.log(products);
            res.json(products);
        })

        // Product Create POST API ...
        app.post('/admins/product/create', async (req, res) => {
            const formData = req.body;
            // console.log(formData);
            const create = await productsCollection.insertOne(formData);
            res.json(create)
        });

        // Product Edit GET API ...
        app.get('/admins/product/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productsCollection.findOne(query);
            // // console.log(product[0]);
            res.json(product);
        });

        // Product Update PUT API ... 
        app.put('/admins/product/update/:id', async (req, res) => {
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
            // // console.log(update);
            res.json(update);
        });

        // Product Delete DELETE API ...
        app.delete('/admins/product/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await productsCollection.deleteOne(query);
            res.json(destroy);
        });

        // Show & Read Product Detail GET API ... 
        app.get('/product-detail/:id', async (req, res) => {
            const query = {_id: ObjectId(req.params.id)};
            const product = await productsCollection.findOne(query);
            // console.log(product);
            res.json(product)
        });


        // =========================================ADMIN ORDER CRUD================================
        // Admin User Read All Orders GET API ...
        app.get("/admins/allOrders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.json(orders);
        });

        // Admin Order Status Changing PUT API ...
        app.put("/admins/order/status/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            // console.log(req.body.status);
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                }
            });
            // console.log(result);
            res.json(result);
        });

        // Admin User Delete Order DELETE API ... 
        app.delete('/admins/allOrder/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await ordersCollection.deleteOne(query);
            res.json(destroy);
        });


        // =========================================GUEST ORDER CRUD================================

        // Guest User Order Create POST API ...
        app.post('/user/order/create', async (req, res) => {
            const formData = req.body;
            const create = await ordersCollection.insertOne(formData);
            res.json(create);
        });

        // Guest User Read Personal/My Orders GET API ...
        app.get("/user/myOrders/:email", async (req, res) => {
            // console.log(req.params.email);
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


        // =============================ADMIN REVIEW CRUD==============================

        // Admin User Read All Reviews GET API ...
        app.get("/admins/allReviews", async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            res.json(reviews);
        });

        // Admin Order Status Changing PUT API ...
        app.put("/admins/review/status/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            // console.log(req.body.display);
            const result = await reviewsCollection.updateOne(filter, {
                $set: {
                    display: req.body.display,
                }
            });
            // // console.log(result);
            res.json(result);
        });

        // Admin User Delete Review DELETE API ... 
        app.delete('/admins/review/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await reviewsCollection.deleteOne(query);
            res.json(destroy);
        });

        // Home Page Read All Reviews(only display: show) GET API ... 
        app.get("/reviews", async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            let showDisplays = [];
            reviews.map(review => {
                if(review.display === "show") {
                    showDisplays.push(review);
                }
            })
            // console.log(showDisplays);
            res.json(showDisplays);
        });

        // =============================GUEST REVIEW CRUD==============================

        // Gust User Read His Reviews GET API ...
        app.get("/user/myReviews/:email", async (req, res) => {
            // console.log(req.params.email);
            const email = { email: req.params.email }
            const result = await reviewsCollection.find(email).toArray();
            res.json(result);
        });

        // Guest User Create Site Review POST API ...
        app.post('/user/site-review/create', async (req, res) => {
            const formData = req.body;
            const create = await reviewsCollection.insertOne(formData);
            res.json(create);
        });

        // Guest User Delete Review DELETE API ... 
        app.delete('/user/review/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await ordersCollection.deleteOne(query);
            res.json(destroy);
        });


        // Guest User Read Order for Create Product review GET API ...
        app.get('/user/order/:id', async (req, res) => {
            const query = {_id: ObjectId(req.params.id)};
            const order = await ordersCollection.findOne(query);
            res.json(order)
        });

        // Guest User Create Product Wise Review POST API ...
        app.post('/user/product-review/create', async (req, res) => {
            const formData = req.body;
            const create = await productWiseReviewsCollection.insertOne(formData);
            res.json(create);
        });

        // Gust User Read His Product wise Reviews GET API ...
        app.get("/user/product-review/:email", async (req, res) => {
            // console.log(req.params.email);
            const email = { email: req.params.email }
            const result = await productWiseReviewsCollection.find(email).toArray();
            if(result) {
                res.json(result);
            }
        });

        // Guest User Delete Product wise Review DELETE API ... 
        app.delete('/user/product-review/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const destroy = await productWiseReviewsCollection.deleteOne(query);
            res.json(destroy);
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