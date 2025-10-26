const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Load .env when present
try{
  require('dotenv').config();
}catch(e){
  // dotenv not installed or .env missing — ignore
}

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('generic-text', { title: 'Not Found', content: 'Page not found' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        family: 4
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    }
  } else {
    console.warn('MONGODB_URI not set. Skipping MongoDB connection.');
  }

  app.listen(PORT, function() {
    console.log(`Weather Dashboard running at http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
