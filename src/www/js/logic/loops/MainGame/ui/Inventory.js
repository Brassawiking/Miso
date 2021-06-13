import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

const buySound = new Audio('https://opengameart.org/sites/default/files/audio_preview/dropmetalthing.ogg.mp3')

export function Inventory({ state: { player }}) {
  const buyItem = itemToBuy => {
    if (itemToBuy != null) {
      const firstEmptySlot = player.items.indexOf(null)
      if (firstEmptySlot < 0) {
        alert('No more room in inventory')
      } else {
        let item = null
        switch (itemToBuy) {
          case 'lightfoot':
            item = {
              name: 'Lightfoot',
              icon: 'https://i.pinimg.com/originals/40/ed/8e/40ed8e381cf0876d77b540144c1247e0.png',
              type: 'mod',
              effects: {
                speed: 0.1,
              }
            }
            break
          case 'eaglewings':
            item = {
              name: 'Lightfoot',
              icon: 'https://i.pinimg.com/originals/3b/37/86/3b37860fb69293ef99bba496fe9cb1d5.png',
              type: 'mod',
              effects: {
                jump: 0.5,
              }
            }
            break
        }
        player.items[firstEmptySlot] = item

        if (buySound.paused) {
          buySound.play()
        } else {
          buySound.currentTime = 0
        }
      }
    }
  }

  return html`
    <div class="inventory">
      <div style="margin: 10px 0;">
        Buy:
        ${' '}
        <button onclick=${() => { buyItem('lightfoot') }}>MOD: "Lightfoot"</button>
        ${' '}
        <button onclick=${() => { buyItem('eaglewings') }}>MOD: "Eagle Wings"</button>
      </div>
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
