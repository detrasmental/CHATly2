const router = require('express').Router();
const sequelize = require('../config/connection');
const path = require('path');




router.get('/', (req, res) => {
    res.render('homepage');
});
  
  
router.get('/chat', (req, res) => {
   
  res.render('chat');
});
  
router.get('/index', (req, res) => {
    res.render('index')
});

router.get('/signup', (req, res) => {
  res.render('signup')
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/login');
    return;
  }

  res.render('login');
});


module.exports = router;