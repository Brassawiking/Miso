import http from 'http'
import fs from 'fs'

import { routes } from './infrastructure/router.js'
import './api/index.js'
import './persistence/entities.js'

const server = http.createServer((req, res) => {
  let requestBody = ''

  req.on('data', (chunk) => {
    requestBody += chunk;
  })

  req.on('end', () => {
    let path = new URL(req.url, `http://${req.headers.host}`).pathname
    const result = (statusCode, headers, body) => {
      res.writeHead(statusCode, headers).end(body)
    }
  
    for (var i = 0 ; i < routes.length ; ++i) {
      const route = routes[i]
      try {
        const routeParams = route.test(req.method, path)
        if (routeParams) {
          const { statusCode, headers, body } = route.callback(routeParams, requestBody)
          return result(statusCode, headers, body)
        }
      } catch (err) {
        console.log(err)
        return result(500, null, http.STATUS_CODES[500])
      }
    }

    if (path === '/') {
      path = '/index.html'
    }
  
    fs.readFile('./src/www' + path, (err, data) => {
      if (err) {
        console.error('Could not serve: ' + path, err)
        return result(404, null, http.STATUS_CODES[404])
      }
      return result(200, { 'Content-Type': getContentType(path) }, data)
    })
  })
})

server.listen(8080, null, null, () => {
  const address = server.address()
  console.log(`Running server at port: ${address.port}`)
})

function getContentType (path) {
  if (path.includes('.js')) {
    return 'text/javascript'
  }
  if (path.includes('.html')) {
    return 'text/html'
  }
  if (path.includes('.svg')) {
    return 'image/svg+xml'
  }
  return 'text/plain'
}