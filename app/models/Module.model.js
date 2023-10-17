const mongoose = require('mongoose');

module.exports = mongoose.model(
    "Module",
    new mongoose.Schema({
        module_name: {
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
    "modules",
);
