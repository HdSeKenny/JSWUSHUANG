import errors from './components/errors'
import path from 'path'

export default function(app) {
  // Insert routes below
  app.use('/api/things', require('./api/thing'))
  app.use('/api/users', require('./api/user'))
  app.use('/api/goods', require('./api/good'))
  app.use('/api/orders', require('./api/order'))
  app.use('/api/dkps', require('./api/dkp'))
  app.use('/api/ocr', require('./api/ocr'))
  app.use('/api/admin', require('./api/admin'))
  app.use('/auth', require('./auth').default)

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(errors[404])

  // All other routes should redirect to the app.html
  app.route('/*').get((req, res) => {
    res.sendFile(path.resolve(`${app.get('appPath')}/index.html`))
  })
}
