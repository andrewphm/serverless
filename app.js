const express = require('express');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.use(express.json());

// Create a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = {
    userId: uuidv4(),
    name,
    email,
  };

  try {
    await dynamoDB
      .put({
        TableName: 'users',
        Item: newUser,
      })
      .promise();

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create user' });
  }
});

// Get a specific user
app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await dynamoDB
      .get({
        TableName: 'users',
        Key: { userId },
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch user' });
  }
});

module.exports = app;
