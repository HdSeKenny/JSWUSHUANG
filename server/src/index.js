// Set default node environment to development
const path = require('path')

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const _root = path.normalize(`${__dirname}/../`)

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('dotenv').config({ path: path.join(_root, '.env.local') })
  require('babel-register')
} else {
  require('dotenv').config()
}

// Export the application
exports = module.exports = require('./app')
