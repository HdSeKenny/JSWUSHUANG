'use strict'

import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon';
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'
import errorHandler from 'errorhandler'
import path from 'path'
import lusca from 'lusca'
import config from './environment'
import passport from 'passport'
import session from 'express-session'
import connectMongo from 'connect-mongo'
import mongoose from 'mongoose'

const MongoStore = connectMongo(session)

export default function(app) {
  const env = app.get('env')

  if (env === 'production') {
    app.use(favicon(path.join(config.root, 'client', 'public', 'favicon.ico')))
    app.set('appPath', path.join(config.root, 'client', 'dist'))
    app.use(express.static(path.join(config.root, 'server', 'dist')))
  }

  if (env === 'development') {
    app.set('appPath', path.join(config.root, 'client', 'src'))
    app.use(express.static(path.join(config.root, 'server')))
  }

  app.use(morgan('dev'))
  app.use(express.static(path.join(config.root, 'server', 'src')))
  app.use(express.static(app.get('appPath')))

  app.set('views', path.join(config.root, 'server', 'views'))
  app.set('view engine', 'html')
  app.engine('html', require('ejs').renderFile)

  app.use(compression())
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
  // app.use(express.json({limit: '50mb'}));
  // app.use(express.urlencoded({limit: '50mb'}));
  app.use(methodOverride())
  app.use(cookieParser())
  app.use(passport.initialize())

  // Persist sessions with MongoStore / sequelizeStore
  // We need to enable sessions for passport-twitter because it's an
  // oauth 1.0 strategy, and Lusca depends on sessions
  app.use(
    session({
      secret: config.secrets.session,
      saveUninitialized: true,
      name: 'tms',
      resave: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        db: 'server'
      })
    })
  )

  /**
   * Lusca - express server security
   * https://github.com/krakenjs/lusca
   */
  if (env !== 'test' && env !== 'development' && !process.env.SAUCE_USERNAME) {
    // eslint-disable-line no-process-env
    app.use(
      lusca({
        csrf: {
          cookie: { name: '_csrf' },
          secret: 'qwerty'
        },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
        nosniff: true,
        referrerPolicy: 'same-origin',
        xframe: 'SAMEORIGIN',
        xssProtection: true
      })
    )
  }

  if (env === 'development' || env === 'test') {
    app.use(errorHandler()) // Error handler - has to be last
  }
}
