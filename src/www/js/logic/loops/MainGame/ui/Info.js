import { LAND } from '../../../entities.js'
import { preact } from '../../../../rendering/ui.js'
const  { html } = preact

export function Info({ state, state: { brush, player, world } }) {
  const landAtBrush = LAND.at(brush.position, world) || {}
  const landAtPlayer = LAND.at(player.position, world)
  
  return html`
    <div class="info ui-box ui-bottom ui-right" style="bottom: 60px;">
      <table>
        <tr><th colspan="2"> ----- Brush info ----- </th></tr>
        <tr><th> Size </th><td> ${(brush.size-1)*2 + 1} </td></tr>
        <tr><th> Position </th><td> ${brush.position[0] + ', ' + brush.position[2]} </td></tr>
        <tr><th> Land name </th><td> ${landAtBrush.owner != null ? landAtBrush.name : 'NOT CLAIMED'} </td></tr>
        <tr><th> Land owner </th><td> ${landAtBrush.owner != null ? landAtBrush.owner : 'NOT CLAIMED'} </td></tr>
        <tr><th> Land props </th><td> ${landAtBrush.propCount + ' / ' + world.maxPropCount} </td></tr>
      </table>

      ${state.debug && html`
        <table>
          <tr><th colspan="2"> ----- Debug info ----- </th></tr>
          <tr><th> Land index </th><td> ${landAtPlayer.x}, ${landAtPlayer.y}  </td></tr>
        </table>
      `}

      ${state.help && html`
        <table>
          <tr><th colspan="2"> ----- Controls ----- </th></tr>
          <tr><th> Enter </th><td> Claim / Rename land </td></tr>
          <tr><th> WASD </th><td> Move </td></tr>
          <tr><th> F </th><td> Dash </td></tr>
          <tr><th> B / N / M </th><td> Recover points </td></tr>
          <tr><th> - </th><td> Cast SHIELD </td></tr>
          <tr><th> Page up </th><td> Jump / Fly up </td></tr>
          <tr><th> Page down </th><td> Fly down </td></tr>
          <tr><th> Up / Down </th><td> Land height </td></tr>
          <tr><th> Left / Right </th><td> Brush size </td></tr>
          <tr><th> Mouse left </th><td> Action </td></tr>
          <tr><th> Mouse right </th><td> Rotate camera </td></tr>
          <tr><th> Mouse wheel </th><td> Zoom </td></tr>
          <tr><th> Space </th><td> Edit prop </td></tr>
          <tr><th> (Shift +) K / L </th><td> Rotate prop </td></tr>
          <tr><th> Delete </th><td> Reset land </td></tr>
          <tr><th> Y </th><td> Sample land height </td></tr>
          <tr><th> O / P </th><td> Change view distance </td></tr>
          <tr><th> [A / B / C / ...] </th><td> Shortcuts </td></tr>
        </table>
      `}
    </div>

    <style>
      .info table {
        font-size: 14px;
        line-height: 12px;
        width: 100%;
      }
      
      .info th {
        text-align: left;
      }
      
      .info th[colspan] {
        text-align: center;
      }
      
      .info td {
        text-align: right;
      }
    </style>
  `
}
