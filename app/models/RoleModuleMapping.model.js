const mongoose = require('mongoose');

module.exports = mongoose.model(
    "User",
    new mongoose.Schema({
        reseller_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Reseller",
            defaultValue: null,
        },
        role_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Role",
            required: true,
        },
        module_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Module",
            required: true,
        },
        sub_module_id:[{
            
        }],
        is_active:{
            type: Boolean,
            defaultValue: true,
        },
        deletedAt:{
            type: Date,
            defaultValue: null,
        }
    },{
        timestamps:true,
    }),
    "users",
);
