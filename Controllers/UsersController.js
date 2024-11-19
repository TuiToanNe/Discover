const User = require('../models/Users');

const UserController = {

 

    /* get single user */
    async get_user(req, res) {
        try {
            const user = await User.findById(req.user.id);
            const { password, ...data } = user._doc;
            res.status(200).json({
                type: "success",
                data
            });

        } catch (err) {
            console.log(err)
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    },

   
    /* update user */
    async update_user(req, res) {
        if(req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 10)
        }
        
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            }, 
            { new: true }
            );
            res.status(200).json({
                type: "success",
                message: "User updated successfully",
                updatedUser
            })
        } catch (err) {
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    },

    /* delete user */
    async delete_user(req, res) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json({
                type: "success",
                message: "User has been deleted successfully"
            });
        } catch (err) {
            res.status(500).json({
                type: "error",
                message: "Something went wrong please try again",
                err
            })
        }
    }
};

module.exports = UserController;