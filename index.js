const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 4000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4hqmewo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		//await client.connect();

		const recipesCollection = client.db('myDB').collection('recipes');
		const usersCollection = client.db('myDB').collection('users');

		//Find All recipes
		app.get('/recipes', async (req, res) => {
			// const cursor = recipesCollection.find();
			// const result = await cursor.toArray();

			const result = await recipesCollection.find().toArray();
			res.send(result);
		})


		//Find Single Coffee By ID
		app.get('/coffees/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) }
			const result = await recipesCollection.findOne(query);
			res.send(result);
		})


		//Post / Save Coffee Method
		app.post('/recipes', async (req, res) => {
			const newCoffee = req.body;
			//console.log(newCoffee);

			const result = await recipesCollection.insertOne(newCoffee);
			res.send(result);
		})



		//Update
		app.put('/coffees/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) }
			const options = { upsert: true };
			const updatedCoffee = req.body;
			const updatedDoc = {
				$set: updatedCoffee
			}

			const result = await recipesCollection.updateOne(filter, updatedDoc, options);
			res.send(result);

		})


		//Delete Coffee
		app.delete('/coffees/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) }
			const result = await recipesCollection.deleteOne(query);
			res.send(result);
		})



		//user related APIs
		//Get All User
		// app.get('/users', async (req, res) => {
		// 	const result = await usersCollection.find().toArray();
		// 	res.send(result);
		// })


		//insert One User
		// app.post('/users', async (req, res) => {
		// 	const userProfile = req.body;
		// 	//console.log(userProfile);
		// 	const result = await usersCollection.insertOne(userProfile);
		// 	res.send(result);

		// })


		//update user Last sign in after successfully login. 
		// app.patch('/users', async (req, res) => {
		// 	//console.log(req.body)
		// 	const { email, lastSignInTime } = req.body;
		// 	const filter = { email: email }
		// 	const updateDoc = {
		// 		$set: {
		// 			lastSignInTime: lastSignInTime
		// 		}
		// 	}
		// 	const result = await usersCollection.updateOne(filter, updateDoc)

		// 	res.send(result);
		// })




		//Delete an user
		// app.delete('/users/:id', async (req, res) => {
		// 	const id = req.params.id;
		// 	const query = { _id: new ObjectId(id) }
		// 	const result = await usersCollection.deleteOne(query);
		// 	res.send(result);
		// })







		// Send a ping to confirm a successful connection

		console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} finally {
		// Ensures that the client will close when you finish/error
		//await client.close();
	}
}
run().catch(console.dir);



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('My Assign Server is getting Running...')
});



app.listen(port, () => {
	console.log(`My Assign server is running on port ${port}`)
})

