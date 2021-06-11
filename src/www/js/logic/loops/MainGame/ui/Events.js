import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

export function Events({ state: { player }}) {
  return html`
    <div class="events">
      <ul>
        ${!player.events.length && html`
          <li>[No events on player currently]</li>
        `}
        ${Object.keys(player.events).map(event => html`
          <li>
            ${event}: ${player.events[event] + ''}
            ${' '}
            <button onclick=${() => { delete player.events[event] }}>
              Remove
            </button>
          </li>
        `)}
      </ul>
    </div>

    <style>
      .events {
        height: 100%; 
        overflow: auto; 
        padding: 20px; 
        box-sizing: border-box;
      }
    </style>

  `
}