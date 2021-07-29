// Set default node environment to development
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv').config()

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register')
}

// Export the application
exports = module.exports = require('./app')
