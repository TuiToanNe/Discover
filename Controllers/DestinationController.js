
const destination = require("../models/Destination");

const DestinationController = {

    async listDestination (req, res, next) {
        try {
            const destinations = await destination.aggregate();
            res.status(200).json(destinations); 
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Lỗi khi lấy danh sách destination" });
        }
    },
    
}

module.exports = DestinationController
