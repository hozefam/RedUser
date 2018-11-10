const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const client = redis.createClient();

client.on('connect', () => {
  console.log('Connected to Redis');
});

// Set Port
const port = 3000;

// init app
const app = express();

// view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// method override
app.use(methodOverride('_method'));

// Search page
app.get('/', (req, res, next) => {
  res.render('searchusers');
});

// Search processing
app.post('/user/search', (req, res, next) => {
  const { id } = req.body;
  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render('searchusers', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      res.render('details', {
        user: obj
      });
    }
  });
});

// Add User Page
app.get('/user/add', (req, res, next) => {
  res.render('adduser');
});

// Process Add User Page
app.post('/user/add', (req, res, next) => {
  const { id, first_name, last_name, email, phone } = req.body;
  client.hmset(
    id,
    [
      'first_name',
      first_name,
      'last_name',
      last_name,
      'email',
      email,
      'phone',
      phone
    ],
    (err, reply) => {
      if (err) console.log(err);

      console.log(reply);
      res.redirect('/');
    }
  );
});

app.listen(port, () => {
  console.log(`server started on ${port}`);
});
