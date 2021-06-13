import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

export function Inventory({ state: { player }}) {
  return html`
    <div class="inventory">
      <div class="grid">
        ${
          player.items.map((item, index) => html`
            <div
              onmousedown=${e => {
                if (e.button == 2) {
                  player.items[index] = null
                }
              }}
              title=${item && `
${item.type.toUpperCase()}:
"${item.name}"

EFFECTS:
${Object.keys(item.effects).map(effect => `${effect}: ${item.effects[effect]}`).join('\n')}

(Right-click to remove)
              `}
              class="slot"
            >
            ${item && html`
              <img 
                src="${item.icon}"
                style="pointer-events: none;"
              />
            `}
            </div>
          `)
        }
      </div>
    </div>

    <style>
      .inventory {
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      .inventory .grid {
        flex: 1 1 0px;
        display: grid;
        grid-template-columns: repeat(20, 1fr);
        grid-template-rows: repeat(10, 1fr);
        gap: 2px;
        overflow: hidden;
      }
      
      .inventory .slot {
        overflow: hidden;
        border-radius: 4px;
        border: 1px solid #777;
        background: linear-gradient(142deg, rgba(2,0,36,1) 0%, rgba(52,58,74,1) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .inventory .slot:hover {
        background: #343a4a;
      }
      
      .inventory .slot img {
        max-width: 100%;
        max-height: 100%;
      }
    </style>
  `
}
