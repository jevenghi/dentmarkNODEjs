const mongoose = require('mongoose');

const invoiceCounterSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  counter: {
    type: Number,
    required: true,
    default: 1,
  },
});

const InvoiceCounter = mongoose.model('InvoiceCounter', invoiceCounterSchema);

module.exports = InvoiceCounter;
