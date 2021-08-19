import express from 'express'
import mongoose from 'mongoose'
// import io from 'socket.io'
mongoose.Promise = require('bluebird')
import config from './config/environment'
import http from 'http'
import expressConfig from './config/express'
import registerRoutes from './routes'
import seedDatabaseIfNeeded from './config/seed'
// import registerSockets from './config/socketio'
// import packageInfo from '../package.json'
// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options)
mongoose.connection.on('error', function (err) {
  console.error(`MongoDB connection error: ${err}`)
  process.exit(-1) // eslint-disable-line no-process-exit
})

// Setup server
const app = express()
const server = http.createServer(app)
// const _ios = io(server, {
//   origins: packageInfo.environment.allowedOrigins,
//   pingTimeout: 60000,
// })

// registerSockets(_ios)
expressConfig(app)
registerRoutes(app)

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'))
  })
}

seedDatabaseIfNeeded()
  .then(startServer)
  .catch((err) => {
    console.log('Server failed to start due to error: %s', err)
  })

// Expose app
exports = module.exports = app
