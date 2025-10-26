const signin = (req, res) => {
  res.render('signin', { title: 'Sign In' });
};

const signinPost = (req, res) => {
  // Very small placeholder: in real app you'd validate credentials
  const email = req.body.email || 'unknown';
  res.render('generic-text', { title: 'Signed In', content: `Signed in as ${email}` });
};

const register = (req, res) => {
  res.render('register', { title: 'Register' });
};

const registerPost = (req, res) => {
  const name = req.body.name || 'User';
  res.render('generic-text', { title: 'Registered', content: `Thanks ${name}, registration simulated.` });
};

const review = (req, res) => {
  res.render('review', { title: 'Review' });
};

const reviewPost = (req, res) => {
  const city = req.body.city || 'unknown';
  const rating = req.body.rating || 'N/A';
  res.render('generic-text', { title: 'Review Submitted', content: `Thanks — review for ${city} (rating ${rating}) received.` });
};

module.exports = { signin, signinPost, register, registerPost, review, reviewPost };
