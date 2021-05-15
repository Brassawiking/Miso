export const markup = (html) => {
  const parser = document.createElement('div')
  parser.innerHTML = html
  const root = parser.firstElementChild
  
  const refs = {}
  root.querySelectorAll('[ref]').forEach(x => {
    refs['ui_' + x.getAttribute('ref')] = x
  })

  return [root, refs]
}