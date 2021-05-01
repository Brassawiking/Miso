import { addRoute, HttpResult } from '../../infrastructure/router.js'

addRoute(
  ['GET'],
  ['test', ['id', Number], ['page', String]], 
  ({ id, page }) => {
    const data = { id, page }
    return HttpResult.json(data)
  }
)

addRoute(
  ['POST'],
  ['test'], 
  (params, body) => {
    const data = JSON.parse(body)
    console.log(data.answer)
    return HttpResult.ok()
  }
)