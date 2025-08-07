const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'flights.json');
const ADMIN_USER = {user:'admin', pass:'password123'};

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('.'));

// Helper functions
function loadFlights() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH)); }
  catch { return []; }
}
function saveFlights(f) { fs.writeFileSync(DATA_PATH, JSON.stringify(f, null,2)); }

function checkAuth(req) {
  return req.cookies.user === ADMIN_USER.user && req.cookies.auth === ADMIN_USER.pass;
}

// Login route
app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  if(user === ADMIN_USER.user && pass === ADMIN_USER.pass) {
    res.cookie('user', user);
    res.cookie('auth', pass);
    res.redirect('/dashboard.html');
  } else res.redirect('/login.html?error=1');
});

// Flights API
app.get('/api/flights', (req, res) => {
  if(!checkAuth(req)) return res.status(401).json({error:'unauth'});
  res.json(loadFlights());
});
app.post('/api/flights', (req, res) => {
  if(!checkAuth(req)) return res.status(401).json({error:'unauth'});
  const f = loadFlights();
  f.push(req.body);
  saveFlights(f);
  res.json({success:true});
});
app.post('/api/flights/edit', (req, res) => {
  if(!checkAuth(req)) return res.status(401).json({error:'unauth'});
  const arr = loadFlights();
  const idx = parseInt(req.body.index,10);
  arr[idx] = req.body.flight;
  saveFlights(arr);
  res.json({success:true});
});
app.post('/api/flights/delete', (req, res) => {
  if(!checkAuth(req)) return res.status(401).json({error:'unauth'});
  const arr = loadFlights();
  arr.splice(parseInt(req.body.index,10),1);
  saveFlights(arr);
  res.json({success:true});
});

app.listen(PORT, () => console.log(`AuviaOps running on port ${PORT}`));
