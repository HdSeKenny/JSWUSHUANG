'use strict'

import mongoose, { Schema } from 'mongoose'

const HistorySchema = new mongoose.Schema({
  type: String,
  fields: Array,
  created: Date,
  symbol: String,
  changed_value: Number,
  sum_after_changed: Number,
  dkp: {
    type: Schema.ObjectId,
    ref: 'DKP'
  },
  operator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
})

export default mongoose.model('History', HistorySchema)
