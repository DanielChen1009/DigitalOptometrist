const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Serve static files from static dir.
app.use(express.static('static'))

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.render('pages/index');
});

app.get('/calibrations', (req, res) => {
    res.render('pages/calibration');
});

app.get('/videodetector', (req, res) => {
    res.render('pages/videodetector');
});

app.get('/testing', (req, res) => {
    res.render('pages/testing');
});

app.get('/results', (req, res) => {
    res.render('pages/results');
});
