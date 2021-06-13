import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

const buySound = new Audio('https://opengameart.org/sites/default/files/audio_preview/dropmetalthing.ogg.mp3')

export function Shop({ state: { player }}) {
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
    <div class="shop">
      <div style="margin: 10px 0;">
        Buy:
        ${' '}
        <button onclick=${() => { buyItem('lightfoot') }}>MOD: "Lightfoot"</button>
        ${' '}
        <button onclick=${() => { buyItem('eaglewings') }}>MOD: "Eagle Wings"</button>
      </div>
    </div>

    <style>
      .shop {
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
    </style>
  `
}
