import { ui, preact } from '../../../rendering/ui.js'
const  { html, render } = preact

import { Toolbar } from './ui/Toolbar.js'
import { EditingProps } from './ui/EditingProps.js'
import { Info } from './ui/Info.js'
import { LandText } from './ui/LandText.js'
import { PropDialog } from './ui/PropDialog.js'
import { BottomUI } from './ui/BottomUI.js'

export function init_UI({
  state,
  data
}) {
  return () => {
    render(html`
      <${Toolbar} state=${state} data=${data} />
      <${Info} state=${state} />
      ${state.editingProps && html`
        <${EditingProps} state=${state} />
      `}

      <${LandText} state=${state} />
      <${PropDialog} state=${state} />

      <${BottomUI}
        state=${state}
      />
    `, ui)
  }
}
