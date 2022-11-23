const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');

require('dotenv').config()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Recycle cloth Server is runnning')
})
app.listen(port, () => {
  console.log("Recyle Cloth Server is running on " , port);
})