const express = require('express');
var cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(cors())

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

const { auth_route, user_route, review_router, destination_router, filters_router  } = require('./routes');

app.use('/api/v1/auth', auth_route);
app.use('/api/v1/users', user_route);
app.use('/api/v1/review', review_router)
app.use('/api/v1/destination', destination_router)
app.use('/api/v1/filters',filters_router)



app.listen(4000, () => {
    console.log("Server is listening on port 4000");
});
