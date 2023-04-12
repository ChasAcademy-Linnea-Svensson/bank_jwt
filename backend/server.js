import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: './key.env' });
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5001;
const users = [];
const accounts = [];
let userIds = 1;
let accountIds = 1;
const secret = process.env.TOKEN;

app.use(bodyParser.json(), cors());

const authenticateAccessToken = (req, res, next) => {
  const token = req.headers.authorization;

  jwt.verify(token, secret, (err, id) => {
    if (err) return res.sendStatus(403);
    req.id = id;
    next();
  });
};

const generateAccessToken = (userId) => {
  return jwt.sign(userId, secret);
};

app.get('/', (req, res) => {
  res.send('Bank backend');
});

app.get('/me/accounts', authenticateAccessToken, (req, res) => {
  const currAccount = accounts.find((acc) => acc.userId == req.id);
  res.send(currAccount);
});

app.put('/me/accounts/:id', authenticateAccessToken, (req, res) => {
  const userAccount = accounts.find(
    (acc) => req.id == acc.userId && acc.id == req.params.id
  );

  userAccount.balance = userAccount.balance + parseInt(req.body.amount);

  res.send(userAccount);
});

app.post('/users', (req, res) => {
  const user = req.body;
  user.id = userIds;

  const userAccount = {
    id: accountIds,
    userId: user.id,
    userName: user.name,
    balance: parseInt(user.balance),
  };

  accounts.push(userAccount);
  accountIds++;
  userIds++;
  users.push(user);
  res.send('user created');
});

app.post('/sessions', (req, res) => {
  const user = req.body;

  const currUser = users.find(
    (u) => u.email == user.email && u.password == user.password
  );

  if (currUser !== null) {
    const token = generateAccessToken(currUser.id);
    res.json({ token });
  } else {
    res.sendStatus(400);
  }
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
