'use strict'

import mongoose from 'mongoose'

const MemberSchema = new mongoose.Schema({
  game_id: String,
}, { strict: false })

MemberSchema.path('game_id').validate(function(value) {
  return this.constructor
    .findOne({ game_id: value })
    .exec()
    .then((member) => {
      if (member) {
        return false
      }
      return true
    })
    .catch(function(err) {
      throw err
    })
}, '这个游戏id已经注册过了')

export default mongoose.model('Member', MemberSchema)
