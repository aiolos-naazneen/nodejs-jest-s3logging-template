const mongoose = require('mongoose');

module.exports = mongoose.model(
    "SubModule",
    new mongoose.Schema({
        module_id:{
            type: mongoose.Schema.Types.ObjectId,
            defaultValue: null,
        },
        sub_module: {
            type: String,
            required: true,
        },
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
    "sub_modules",
);
