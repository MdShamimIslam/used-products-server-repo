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
  // perform actions on the collection object
 
async function dbConncet () {
  try {
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

    app.get("/booking", async(req, res) => {

    let query = {};
    if(req.query.email) {
      query ={ email : req?.query?.email}
      
    }
    const result = await bookingCollection.find(query).toArray();
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