const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
//recyclecloth400310
//recycle-cloth
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


//mongodb setup
 console.log(process.env.DB_NAME);
 console.log(process.env.DB_PASSWORD);

// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.9arzfvs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
  const categoryCollection = client.db("recycleCloth").collection("categories");
  const productsCollection = client.db("recycleCloth").collection("products");
  const bookingCollection = client.db("recycleCloth").collection("bookings");
  const userCollection = client.db("recycleCloth").collection("users");
  // perform actions on the collection object
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

  app.post("/user", async(req,res) =>{
    const user = req.body;
    console.log("post user", user);
    const result = await userCollection.insertOne(user);
    res.send(result)
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
 
  app.post("/product", async(req, res) => {
    const product = req.body;
    const result = await productsCollection.insertOne(product);
    console.log(result);
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