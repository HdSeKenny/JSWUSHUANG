'use strict'
import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema({
  announcement: String
})

export default mongoose.model('Admin', AdminSchema)
