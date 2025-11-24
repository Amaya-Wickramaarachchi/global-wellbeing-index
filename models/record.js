const mongoose = require('mongoose');

const WellbeingFactorsSchema = new mongoose.Schema({
    populationDensity: { type: Number, required: true },
    airQuality: { type: Number, required: true },
    weatherComfort: { type: Number, required: true },
}, { _id: false });

const RecordSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city: { type: String, required: true },
    country: { type: String, required: true },
    totalScore: { type: Number, required: true },
    wellbeingFactors: { type: WellbeingFactorsSchema, required: true },
    dateSaved: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Record', RecordSchema);
