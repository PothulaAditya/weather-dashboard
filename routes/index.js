const express = require('express');
const router = express.Router();

const weatherController = require('../controllers/weather');
const mainController = require('../controllers/main');
const othersController = require('../controllers/others');
const manageController = require('../controllers/manage');

// Home
router.get('/', weatherController.homelist);
// Forecast
router.get('/forecast', weatherController.forecast);

// Manage stored weather data
router.get('/manage', manageController.list);
router.post('/manage/update', manageController.update);
router.post('/manage/delete', manageController.remove);

// About
router.get('/about', othersController.about);

// Auth / user pages
router.get('/signin', mainController.signin);
router.post('/signin', mainController.signinPost);
router.get('/register', mainController.register);
router.post('/register', mainController.registerPost);
router.get('/review', mainController.review);
router.post('/review', mainController.reviewPost);

module.exports = router;
