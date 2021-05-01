export const routes = []

export const addRoute = (methods, routeSegments, callback) => {
  methods = methods.map(x => x.toLowerCase())
  // Validate route segments

  routes.push({
    test: (method, path) => {
      if (!methods.includes(method.toLowerCase())) {
        return false
      }

      const pathSegments = path.split('/').filter(x => x)      
      if (pathSegments.length !== routeSegments.length) {
        return false
      }

      const routeParams = {}
      for (let i = 0 ; i < routeSegments.length ; ++i) {
        const routeSegment = routeSegments[i]
        const pathSegment = pathSegments[i]
        
        if (Array.isArray(routeSegment)) {
          const [key, bind] = routeSegment
          routeParams[key] = bind(pathSegment)
        } else if (routeSegment.toLowerCase() !== pathSegment.toLowerCase()) {
          return false
        }
      }
      return routeParams
    },
    callback
  })
}

export class HttpResult {
  constructor(statusCode, headers, body) {
    this.statusCode = statusCode
    this.headers = headers
    this.body = body
  }

  static ok () {
    return new HttpResult(200)    
  }

  static json (data) {
    const dataJson = JSON.stringify(data)
    return new HttpResult(
      200,
      {
        'Content-Type': 'application/json',
        'Content-Length': dataJson.length
      },
      dataJson
    )    
  }

  static html (html) {
    return new HttpResult(
      200,
      {
        'Content-Type': 'text/html; charset=UTF-8',
        'Content-Length': html.length
      },
      html
    )
  }
}
