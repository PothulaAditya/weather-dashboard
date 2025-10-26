const about = (req, res) => {
  res.render('generic-text', { title: 'About', content: 'Weather Dashboard - simple app built with Express and Pug.' });
};

module.exports = { about };
