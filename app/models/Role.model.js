const mongoose = require('mongoose');

module.exports = mongoose.model(
    "Role",
    new mongoose.Schema({
        reseller_id:{
            type: mongoose.Schema.Types.ObjectId,
            defaultValue: null,
        },
        type:{
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        display_name:{
            type: String,
            required: true,
        },
        permissions:[
            {
                _id:false,
                module:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"Module",
                },
                sub_modules:[{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"SubModule",
                }]    
            }
        ],
        deletedAt:{
            type: Date,
            defaultValue: null,
        }
    },{
        timestamps:true,
    }),
    "roles",
);
