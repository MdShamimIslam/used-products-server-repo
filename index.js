const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_TOKEN);
const app = express();
const cors = require('cors');
//recyclecloth400310
//recycle-cloth
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


//mongodb setup
 console.log(process.env.DB_NAME);
 console.log(process.env.DB_PASSWORD);
console.log(process.env.STRIPE_TOKEN);
// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.9arzfvs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
  const categoryCollection = client.db("recycleCloth").collection("categories");
  const productsCollection = client.db("recycleCloth").collection("products");
  const bookingCollection = client.db("recycleCloth").collection("bookings");
  const userCollection = client.db("recycleCloth").collection("users");
const paymentsCollection = client.db("recycleCloth").collection("payments");

  // perform actions on the collection object[[[]]]
 
  function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  } 



else {
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
    
  if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
  else{
     req.decoded = decoded;
     next();
   }      
  
  });
}

}


  const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

  const verifySeller = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }
 


async function dbConncet () {
  try {

  app.get("/jwt", async(req, res) => {
  console.log("jwt email", req.query.email);
  const email = req.query.email;
  console.log(req.query.email);
  const query = {email : email};
  const user = await userCollection.findOne(query);
  console.log("jwt user", user);
  if(user) {
    const token = jwt.sign({email},process.env.JWT_TOKEN , {expiresIn : '1d'})
    console.log(token);
    return  res.send({"accessToken":  token});
  }

  // console.log(result);
  res.status(403).send({accessToken : " "});
})
// verifyyyyy User

  //   const verifyAdmin = async (req, res, next) => {
  //           const decodedEmail = req.decoded.email;
  //           const query = { email: decodedEmail };
  //           console.log("verify admin",decodedEmail, query );
  //           const user = await userCollection.findOne(query);
            
  //           if (user?.role !== 'Admin') {
  //               return res.status(403).send({ message: 'forbidden access' })
  //           }
  //           next();
  // }
    app.put('/user/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        });



     app.put('/user/verify/:email', verifyJWT, async (req, res) => {
             const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const email = req.params.email;
            const filter = { seller_email: email }
            const userFilter = {email}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: true,
                }
            }
            const updateUser = await userCollection.updateOne(filter, userFilter, options)
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(updateUser)
            res.send(result)
        });



    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      // console.log("jwt user", user);
      res.send({ isAdmin: user?.role === 'Admin' });
  })

      app.get('/user/seller/:email', async (req, res) => {
      const email = req.params.email;
      // console.log("verify seller email get", email);
      const query = { email }
      const user = await userCollection.findOne(query);
      // console.log("verify seller user get", user);
      //   console.log("verify seller user get", user?.role);

      res.send({ isSeller: user?.role === 'Seller' });
  })

  // //verify Seller
  //     const verifySeller = async (req, res, next) => {
  //           const decodedEmail = req.decoded.email;
  //           const query = { email: decodedEmail };
  //           const user = await userCollection.findOne(query);
  //           console.log("check seller user", user);
  //           if (user?.role !== 'Buyer') {
  //               return res.status(403).send({ message: 'forbidden access' })
  //           }
  //           next();
  // }


  //verufy Buyer

  //       const verifyBuyer = async (req, res, next) => {
  //           const decodedEmail = req.decoded.email;
  //           const query = { email: decodedEmail };
  //           const user = await userCollection.findOne(query);

  //           if (user?.role !== 'Seller') {
  //               return res.status(403).send({ message: 'forbidden access' })
  //           }
  //           next();
  // }
    app.get('/user/buyer/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'Admin' });
  })


  app.post("/user", async(req,res) =>{
    const user = req.body;
    console.log("post user", user);
    const result = await userCollection.insertOne(user);
    res.send(result)
  })
  
    app.get("/user",verifyJWT,verifyAdmin, async(req, res) => {
    const accountType  = req.query.role;
    // console.log("line 151", accountType);
    console.log("line 155 role user", accountType);

    const query = {role : accountType}
    const result = await userCollection.find(query).toArray();
    console.log("seller money",result);
    res.send(result);
  })
app.delete("/user/:id", async(req,res) => {
   const id = req.params.id;
   const query = {_id : ObjectId(id)};
    const result = await userCollection.deleteOne(query);
    res.send(result);
})



 app.get("/category", async(req, res) => {
    const query = {};
    const result = await categoryCollection.find(query).toArray();
    res.send(result)
  })

  app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const result = await productsCollection.find(query).toArray();
      console.log(result);
      res.send(result);

      
    })

  app.get("/advertise", async(req, res) => {
      const query = {advertise : true, paid: false};
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    })

     app.post('/booking', async(req, res) => {
    const product = req.body;
    const result = await bookingCollection.insertOne(product);
    console.log(result);
    res.send(result);
  })



  
  app.get("/booking",verifyJWT, async(req, res) => {

    let query = {};
    if(req.query.email) {
      query ={ email : req?.query?.email}
      
    }
    const result = await bookingCollection.find(query).toArray();
    res.send(result);
  })
 
  app.delete("/booking/:id", verifyJWT, async(req, res) => {
    const id = req.params.id;
    const query = {_id : ObjectId(id)};
    const result = await bookingCollection.deleteOne(query);
    console.log("booking delete",result);
    res.send(result);
  })
   app.get("/booking/:id", async(req, res) => {
    const id = req.params.id;
    const query = {_id : ObjectId(id)};
    const booking = await productsCollection.findOne(query);
    res.send(booking)
    console.log("book 1", booking);
   })
  app.post("/product",verifyJWT, verifySeller, async(req, res) => {
    const product = req.body;
    const result = await productsCollection.insertOne(product);
    console.log(result);
    res.send(result);

  })
  app.get("/product", async(req, res) => {
    const email = req.query.email;
    const query = {seller_email : req.query.email}
    console.log("product", email);
    const result = await productsCollection.find(query).toArray();
    console.log(result);
    res.send(result);

  })
  app.get("/product/report", async(req, res) => {
    
    const query = {report : true}
    const result = await productsCollection.find(query).toArray();
    console.log(result);
    res.send(result);

  })
  app.delete("/product/:id", async(req, res) => {
     const id = req.params.id;
    const filter = { _id: ObjectId(id) }
    const result = await productsCollection.deleteOne(filter);
    res.send(result);
  })
  app.put('/product/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);

            if (user?.role !== 'Seller') {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    advertise: true
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            console.log("advertise update", result);
            res.send(result)
        });
  app.put('/product/report/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    report: true
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            console.log("advertise update", result);
            res.send(result)
        });

 


app.post("/create-payment-intent", async (req, res) => {
  const  booking = req.body;
  console.log("Booking", booking);
  const price = booking?.resale_price;
  const amount = price * 100;


  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
      "payment_method_types": [
    "card"
  ],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

  app.post('/payments', async (req, res) =>{
    const payment = req.body;
    console.log("payment", payment);
    const result = await paymentsCollection.insertOne(payment);
    const id = payment.bookingId;

    const bookingFilter =  {product_id : id};
    const bookedfind = await bookingCollection.findOne(bookingFilter);
    console.log("bookedfind", bookedfind); 
    const filter = {_id: ObjectId(id)}
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult = await productsCollection.updateOne(filter, updatedDoc);
    const updatedBooked = await bookingCollection.updateOne(bookingFilter, updatedDoc);
    console.log("updatebooked", updatedBooked );
    console.log(updatedResult);
    res.send(result);
})



    
  } catch (error) {
    console.log("line 32", error);

    
  }

 }
 dbConncet().catch(error => console.log("line 30 ",error))


app.get('/', (req, res) => {
  res.send('Recycle cloth Server is runnning')
})
app.listen(port, () => {
  console.log("Recyle Cloth Server is running on " , port);
})