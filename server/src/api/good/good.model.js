'use strict'

import mongoose, { Schema } from 'mongoose'

const GoodSchema = new mongoose.Schema({
  good_name: String,
  min_price: Number,
  range_price: Number,
  once_price: Number,
  created_at: Date,
  started_at: Date,
  ended_at: Date,
  range_hours: Number,
  range_minutes: Number,
  current_price: Number,
  image_url: String,
  desc: String,
  au_type: {
    type: String,
    default: 'DKP'
  },
  status: {
    type: Number,
    default: 0
  },
  previous_price: Number,
  previous_payer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  current_payer: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  auction_histories: [{
    au_price: Number,
    au_player_name: String,
    au_date: Date
  }]
})

export default mongoose.model('Good', GoodSchema)
