const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); 
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());


let data = {
  reservations: [],
  availabilities: [],
  absences: [],
};


const getCollection = (collectionName) => {
  if (!data[collectionName]) {
    throw new Error(`Collection "${collectionName}" does not exist.`);
  }
  return data[collectionName];
};

app.get('/:collectionName', (req, res) => {
  try {
    const collection = getCollection(req.params.collectionName);
    res.json(collection);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/:collectionName', (req, res) => {
  try {
    const collection = getCollection(req.params.collectionName);
    const newItem = { id: uuidv4(), ...req.body }; 
    collection.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.delete('/:collectionName/:id', (req, res) => {
  try {
    const collectionName = req.params.collectionName;
    const id = req.params.id;

    const collection = getCollection(collectionName);
    const itemIndex = collection.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: `Item with ID "${id}" not found.` });
    }

    collection.splice(itemIndex, 1); 
    res.status(204).send(); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
