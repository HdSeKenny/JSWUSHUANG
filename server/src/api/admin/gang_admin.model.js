'use strict'
import mongoose from 'mongoose'

const GangAdminSchema = new mongoose.Schema({
  game_name: String,
  wechat: String,
  gang: String,
})

export default mongoose.model('GangAdmin', GangAdminSchema)
