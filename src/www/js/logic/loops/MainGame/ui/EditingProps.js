import { jsonCopy } from '../../../../common/util.js'
import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

export function EditingProps({ state, state: { editingProps } }) {
  const updateProps = () => {
    editingProps.forEach(prop => { 
      prop.text = editingProps[0].text 
      prop.activeText = editingProps[0].activeText 
      prop.interactions = jsonCopy(editingProps[0].interactions) 
    })
  }
  
  return html`
    <div 
      class="ui-box" 
      style="z-index: 200; inset: 100px; position: absolute;"
      tabindex="-1" 
      onmousedown=${e => { e.stopPropagation() }}
      onmousemove=${e => { e.stopPropagation() }}
      onmousewheel=${e => { e.stopPropagation() }}
      onkeydown=${e => { e.stopPropagation() }}
    >
      <h1>
        Editing ${editingProps.length} prop(s)
        ${' '}
        <button onclick=${e => { state.editingProps = null }}>
          Done
        </button>
      </h1>

      <label style="display: inline-block;">
        Prop text <br/>
        <textarea
          autofocus
          style="width: 300px; height: 100px; box-sizing: border-box; resize: none;"
          placeholder="Something to grab the attention..."
          value=${editingProps[0].text || ''}
          oninput=${e => {
            editingProps[0].text = e.target.value
            updateProps()
          }}
        />
      </label>

      ${' '}

      <label style="display: inline-block; visibility: hidden;">
        Current interaction text <br/>
        <textarea
          style="width: 300px; height: 100px; box-sizing: border-box; resize: none;"
          placeholder="Added through interactions..."
          value=${editingProps[0].activeText || ''}
          oninput=${e => {
            editingProps[0].activeText = e.target.value
            updateProps()
          }}
        />
      </label>

      <div style="display: none;">
      <h2>Interactions</h2>
      <button onclick=${e => {
        editingProps[0].interactions.push({
          action: 'Could you tell me more?',
          conditions: {
            greeter1: false
          },
          effects: {
            text: 'It is just like, reeeeaaaaally big maaaan',
            events: {
              greeter1: true
            } 
          }
        })
        updateProps()
      }}>
        Add interaction
      </button>

      ${editingProps[0].interactions.map(interaction => html`
        <div style="display: flex;">
          <div>
            Action:<br/>
            <input 
              value=${interaction.action}
              oninput=${e => {
                interaction.action = e.target.value
                updateProps()
              }}
            />
          </div>

          <div>
            Effects:
            <div>
              <input 
                type="checkbox" 
                checked=${interaction.effects.text != null}
                oninput=${() => {
                  interaction.effects.text != null 
                  ? delete interaction.effects.text 
                  : interaction.effects.text = 'Hello'
                }}
              />
              Text:
              <input value=${interaction.effects.text} disabled=${interaction.effects.text == null}/>
            </div> 
          </div>

          <button onclick=${() => {
            editingProps[0].interactions.splice(editingProps[0].interactions.indexOf(interaction), 1)
            updateProps() 
          }}>
            Remove
          </button>
        </div>
      `)}
     </div>
    </div>
  `
}