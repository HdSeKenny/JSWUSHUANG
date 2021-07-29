'use strict'

import mongoose, { Schema } from 'mongoose'

const DKPSchema = new mongoose.Schema({
  game_id: String,
  game_name: String,
  gang: String,
  profession: String,
  tianjiang: {
    type: Number,
    defalt: 0
  },
  league_friday: {
    type: Number,
    defalt: 0
  },
  league_saturday: {
    type: Number,
    defalt: 0
  },
  gemstone: {
    type: Number,
    defalt: 0
  },
  field: {
    type: Number,
    defalt: 0
  },
  territorial_stronghold: {
    type: Number,
    defalt: 0
  },
  original: {
    type: Number,
    defalt: 0
  },
  payment: {
    type: Number,
    defalt: 0
  },
  sum: Number,
  updated: Date,
  histories: [{
    type: Schema.ObjectId,
    ref: 'History'
  }]
}, { strict: false })

export default mongoose.model('DKP', DKPSchema)
