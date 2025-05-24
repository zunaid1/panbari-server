
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


 

		// Find the recipe with the highest LikeCount
		app.get('/recipes/top-liked', async (req, res) => {
			try {
				const result = await recipesCollection
					.find()
					.sort({ LikeCount: -1 })
					.limit(6) // Top 5
					.toArray();

				res.send(result);
			} catch (error) {
				console.error('Error fetching top liked recipes:', error);
				res.status(500).send({ error: 'Internal Server Error' });
			}
		});



		//Find Single recipes By ID
		app.get('/recipes/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) }
			const result = await recipesCollection.findOne(query);
			res.send(result);
		})


		// Find All recipes by Added me. Filtered with  "userEmail" feild. 
		app.get('/recipesByEmail', async (req, res) => {
			const userEmail = req.query.userEmail;

			if (!userEmail) {
				return res.status(400).send({ error: 'userEmail query parameter is required' });
			}

			try {
				const result = await recipesCollection.find({ userEmail: userEmail }).toArray();
				res.send(result);
			} catch (error) {
				console.error('Error fetching recipes:', error);
				res.status(500).send({ error: 'Internal server error' });
			}
		});



		//Post / Save recipes Method
		app.post('/recipes', async (req, res) => {
			const newRecipe = req.body;

			const result = await recipesCollection.insertOne(newRecipe);
			res.send(result);
		})



		//Update
		app.put('/recipes/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) }
			const options = { upsert: true };
			const updatedRecipe = req.body;
			const updatedDoc = {
				$set: updatedRecipe
			}

			const result = await recipesCollection.updateOne(filter, updatedDoc, options);
			res.send(result);

		})


		//Delete recipes
		app.delete('/recipes/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) }
			const result = await recipesCollection.deleteOne(query);
			res.send(result);
		})


		app.put('/recipes/:id/like', async (req, res) => {
			const { id } = req.params;

			try {
				if (!ObjectId.isValid(id)) {
					return res.status(400).json({ error: 'Invalid recipe ID' });
				}

				const filter = { _id: new ObjectId(id) };
				const update = { $inc: { LikeCount: 1 } };

				// Update the like count
				const result = await recipesCollection.updateOne(filter, update);

				if (result.matchedCount === 0) {
					return res.status(404).json({ error: 'Recipe not found' });
				}

				// Fetch updated recipe to send new like count
				const updatedRecipe = await recipesCollection.findOne(filter);
				res.send(updatedRecipe);

			} catch (err) {
				console.error("Update error:", err);
				res.status(500).json({ error: 'Failed to update like count' });
			}
		});




		// Increase LIKE By Clicking Heart icon from details page
		// Increase LIKE By Clicking Heart icon from details page
		// app.put('/recipes/:id', async (req, res) => {
		// 	const { id } = req.params;

		// 	if (!MongoClient.Types.ObjectId.isValid(id)) {
		// 		return res.status(400).json({ error: 'Invalid recipe ID' });
		// 	}

		// 	try {
		// 		const updatedRecipe = await Recipe.findByIdAndUpdate(
		// 			id,
		// 			{ $inc: { LikeCount: 1 } }, // 
		// 			{ new: true }
		// 		);
		// 		if (!updatedRecipe) {
		// 			return res.status(404).json({ error: 'Recipe not found' });
		// 		}
		// 		console.log(updatedRecipe)
		// 		res.json(updatedRecipe);
		// 	} catch (err) {
		// 		res.status(500).json({ error: 'Failed to update like count' });
		// 	}
		// });

		// app.put('/recipes/:id/like', async (req, res) => {
		// 	const { id } = req.params;

		// 	try {
		// 		if (!ObjectId.isValid(id)) {
		// 			return res.status(400).json({ error: 'Invalid recipe ID' });
		// 		}

		// 		const updatedRecipe = await recipesCollection.findOneAndUpdate(
		// 			{ _id: new ObjectId(id) },
		// 			{ $inc: { LikeCount: 1 } },
		// 			{ returnDocument: 'after' } // returns the updated document
		// 		);

		// 		if (!updatedRecipe.value) {
		// 			return res.status(404).json({ error: 'Recipe not found' });
		// 		}

		// 		res.json(updatedRecipe.value);
		// 	} catch (err) {
		// 		console.error("Update error:", err);
		// 		res.status(500).json({ error: 'Failed to update like count' });
		// 	}
		// });

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

