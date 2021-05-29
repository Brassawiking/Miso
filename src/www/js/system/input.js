import { jsonCopy } from '../common/util.js'

const _keyboard = {}
const _prevKeyboard = jsonCopy(_keyboard)
const _mouse = { x: 0, y: 0, buttons: [], wheel: 0 }
const _prevMouse = jsonCopy(_mouse)

export const keyboard = {
  key:      key => _keyboard[key],
  keyOnce:  key => _keyboard[key] && !_prevKeyboard[key],
}

export const mouse = {
  get x()           { return _mouse.x },
  get y()           { return _mouse.y },
  
  get left()        { return _mouse.buttons[0] },
  get leftOnce()    { return _mouse.buttons[0] && !_prevMouse.buttons[0] },
  get middle()      { return _mouse.buttons[1] },
  get middleOnce()  { return _mouse.buttons[1] && !_prevMouse.buttons[1] },
  get right()       { return _mouse.buttons[2] },
  get rightOnce()   { return _mouse.buttons[2] && !_prevMouse.buttons[2] },
  
  get wheel()       { return _mouse.wheel },
}

export function updatePrevInput() {
  for (let prop in _prevKeyboard) {
    delete _prevKeyboard[prop]
  }
  Object.assign(_prevKeyboard, _keyboard)

  for (let prop in _prevMouse) {
    delete _prevMouse[prop]
  }
  Object.assign(_prevMouse, _mouse)
  _prevMouse.buttons = jsonCopy(_prevMouse.buttons)
  _mouse.wheel = 0
}

document.addEventListener('keydown', e => { _keyboard[e.key.toUpperCase()] = true; })
document.addEventListener('keyup', e => { _keyboard[e.key.toUpperCase()] = false })

document.addEventListener('contextmenu', e => { e.preventDefault() })
document.addEventListener('wheel', e => { _mouse.wheel = e.deltaY })
document.addEventListener('mousedown', e => { _mouse.buttons[e.button] = true })
document.addEventListener('mouseup', e => { _mouse.buttons[e.button] = false })
document.addEventListener('mousemove', e => {
  _mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  _mouse.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1
})

document.addEventListener('touchstart', e => {
  const touch = e.changedTouches[0]
  _mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
  _mouse.y = (1 - (touch.clientY / window.innerHeight)) * 2 - 1
  _mouse.buttons[0] = true
})
document.addEventListener('touchmove', e => {
  e.preventDefault()
  const touch = e.changedTouches[0]
  _mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
  _mouse.y = (1 - (touch.clientY / window.innerHeight)) * 2 - 1
})
document.addEventListener('touchend', e => {
  _mouse.buttons[0] = false
})
