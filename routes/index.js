const auth_route = require('./Auth');
const user_route = require('./Users');
const review_router = require('./Review')
const destination_router = require('./Destination')
const filters_router = require('./Filters')

module.exports = {
    auth_route,
    user_route,
    review_router,
    destination_router,
    filters_router
};