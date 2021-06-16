import { sound_buy } from '../../../../audio/soundEffects.js'
import { preact } from '../../../../rendering/ui.js'
const  { html } = preact


const items = [
  {
    name: 'Lightfoot',
    icon: 'https://i.pinimg.com/originals/40/ed/8e/40ed8e381cf0876d77b540144c1247e0.png',
    type: 'mod',
    effects: {
      speed: 0.1,
    }
  },
  {
    name: 'Eagle Wings',
    icon: 'https://i.pinimg.com/originals/3b/37/86/3b37860fb69293ef99bba496fe9cb1d5.png',
    type: 'mod',
    effects: {
      jump: 0.5,
    }
  },
  {
    name: 'Traveler',
    icon: 'https://opengameart.org/sites/default/files/styles/medium/public/cystal_full.png',
    type: 'mod',
    effects: {
      speed: 10,
    }
  },
]

export function Shop({ state: { player }}) {
  const buyItem = item => {
    const firstEmptySlot = player.items.indexOf(null)
    if (firstEmptySlot < 0) {
      alert('No more room in inventory')
    } else {
      player.items[firstEmptySlot] = item
      sound_buy()
    }
  }

  return html`
    <div class="shop">
      ${items.map(item => html`
        <div class="item" onclick=${() => { buyItem(item) }}>
          <img src="${item.icon}" />
          <div>
            ${item.type.toUpperCase()}
            <h1>${item.name}</h1>
          </div>
        </div>
      `)}
    </div>

    <style>
      .shop {
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        overflow: auto;
      }

      .shop .item {
        border: 1px solid #fff;
        padding: 10px 30px;
        box-sizing: border-box;
        display: flex;
        margin: 20px 0;
        background: #000;
        border-radius: 15px;
        cursor: pointer;
        align-items: center;
      }

      .shop .item:hover {
        background: #fff;
        color: #000;
      }

      .shop .item img {
        height: 80px;
        width: 80px;
        margin-right: 30px;
        text-align: center;
      }

      .shop .item h1 {
        margin: 0;
      }
    </style>
  `
}
