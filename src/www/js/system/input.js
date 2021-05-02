import { jsonCopy } from '../common/util.js'

export const keyboard = {}
export const prevKeyboard = jsonCopy(keyboard)
document.addEventListener('keydown', e => { keyboard[e.key.toUpperCase()] = true; })
document.addEventListener('keyup', e => { keyboard[e.key.toUpperCase()] = false })

export const mouse = { x: 0, y: 0, buttons: [] }
export const prevMouse = jsonCopy(mouse)
document.addEventListener('contextmenu', e => { e.preventDefault() })
document.addEventListener('mousedown', e => { mouse.buttons[e.button] = true })
document.addEventListener('mouseup', e => { mouse.buttons[e.button] = false })
document.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = (1 - (e.clientY / window.innerHeight)) * 2 - 1
})

export function updatePrevInput() {
  for (let prop in prevKeyboard) {
    delete prevKeyboard[prop]
  }
  Object.assign(prevKeyboard, keyboard)

  for (let prop in prevMouse) {
    delete prevMouse[prop]
  }
  Object.assign(prevMouse, mouse)
  prevMouse.buttons = jsonCopy(prevMouse.buttons)
}