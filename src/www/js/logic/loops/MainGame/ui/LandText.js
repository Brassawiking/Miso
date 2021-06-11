import { preact } from '../../../../rendering/ui.js'
import { LAND } from '../../../entities.js'
const  { html, useEffect } = preact

export function LandText({ state: { player, world }}) {
  const activeLand = LAND.at(player.position, world)

  useEffect(() => {
    // Temp fix
    const element = document.querySelector('.js-land-text')
    let fadeTimer

    element.classList.remove('ui-fade-in')
    element.classList.add('ui-fade-out')

    fadeTimer = setTimeout(() => {
      // Temp fix
      element.innerHTML = `
        <h1 style="text-align: center;">${activeLand.name || 'Unclaimed Land...'}</h1>
        ${activeLand.owner || '(You can claim this land if you want to)'} 
      `
      element.classList.add('ui-fade-in')
      element.classList.remove('ui-fade-out')
      element.hidden = false
      
      fadeTimer = setTimeout(() => {
        element.classList.remove('ui-fade-in')
        element.classList.add('ui-fade-out')
      }, 2000)
    }, 1000)

    return () => {
      clearTimeout(fadeTimer)
    }
  }, [activeLand.name, activeLand.owner])

  return html`
    <div 
      hidden
      class="js-land-text ui-box ui-center" 
      style="text-align: right;"
    />
  `
}
