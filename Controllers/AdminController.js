const Users = require("../models/Users");




const AdminController = {

        async get_all_user(req, res, next) {
    
            try {
    
                const adminId = req.user.id;
                
                if(adminId) {  // check id of admin

                    const users = await Users.find({user_type: 'user'});

                    return res.status(200).json(users);

                } else {
                    res.status(400).json('Admin phải đăng nhập!')
                }
                
            } catch (error) {
                console.log(error);
            }
    
        },

        async delete_a_user(req, res, next) {

            try {
                
                const adminId = req.user.id;
                const userId = req.params.id;

                console.log(userId)

                const user = Users.findOne({_id: userId})

                if(adminId && user) {

                    await Users.deleteOne({_id: userId});

                    return res.status(200).json('Đã xoá thành công người dùng lày!')

                } else {
                    return res.status(400).json('Admin cần phải đăng nhập!');
                }

            } catch (error) {
                console.log(error);
            }

        }

    
}

module.exports = AdminController;