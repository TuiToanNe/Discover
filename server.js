const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

/* configure body-parser */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://toanocchocute:toandeptrai@store.ec6vh.mongodb.net/?retryWrites=true&w=majority&appName=Store", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

const { auth_route, user_route, review_router  } = require('./routes');

app.use('/api/v1/auth', auth_route);
app.use('/api/v1/users', user_route);
app.use('/api/v1/review', review_router)

// app.get('/', (req, res) => {
//     res.send('Hello World')
//   })

app.listen(1000, () => {
    console.log("Server is listening on port 1000");
});
