'use strict'

import mongoose, { Schema } from 'mongoose'

const OrderSchema = new mongoose.Schema({
  price: Number,
  created_at: Date,
  good_id: {
    type: Schema.ObjectId,
    ref: 'Good'
  },
  payer_id: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: Number,
    default: 1
  },
})

export default mongoose.model('Order', OrderSchema)
