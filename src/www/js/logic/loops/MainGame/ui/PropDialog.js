import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

export function PropDialog({ state, state: { player } }) {
  return html`
    ${state.interactiveLandpoint && html`
      <div class="ui-box ui-center" style="white-space: pre;">
        ${state.interactiveLandpoint.prop.activeText || state.interactiveLandpoint.prop.text}
        ${state.interactiveLandpoint.prop.interactions && 
          state.interactiveLandpoint.prop.interactions
            .filter(interaction => {
              if (interaction.conditions) {
                for (const condition in interaction.conditions) {
                  if (!!player.events[condition] != interaction.conditions[condition]) {
                    return false
                  }
                }
              }
              return true
            })
            .map(interaction => html`
              <button
                onmousedown=${e => {
                  e.stopPropagation()
                  const effects = interaction.effects
                  if (effects.text || effects.text == null) {
                    state.interactiveLandpoint.prop.activeText = effects.text
                  }
                  for (const event in effects.events) {
                    player.events[event] = effects.events[event]
                  }
                }}
                style="display: block; margin: 10px auto;"
              >
                ${interaction.action}
              </button>
            `)
        }
      </div>
    `}
  `
}
