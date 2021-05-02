export const output = document.createElement('output')
Object.assign(output.style, {
  position: 'fixed',
  backfaceVisibility: 'hidden',
  top: 0,
  right: 0,
  color: '#fff',
  background: 'rgba(0, 0, 0, 0.3)',
  padding: '10px',
  textAlign: 'right',
  fontSize: '14px',
  lineHeight: '14px',
  fontFamily: '"Gothic A1", sans-serif'
})
document.body.appendChild(output)

