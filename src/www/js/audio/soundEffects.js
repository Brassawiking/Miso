export const sound_login = createSoundEffect('https://opengameart.org/sites/default/files/Accept_0.mp3', 0.4)

export const sound_menu = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/mouseclick.wav.mp3')
export const sound_tab = createSoundEffect('https://opengameart.org/sites/default/files/Menu%20Selection%20Click%20%28preview%29.mp3')
export const sound_buy = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/dropmetalthing.ogg.mp3')

export const sound_jump = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/fall.wav.mp3', 0.25)
export const sound_dash = createSoundEffect('https://opengameart.org/sites/default/files/sfx_fly.mp3', 0.25)
export const sound_recovery = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/click.wav.mp3')
export const sound_lava = createSoundEffect('https://opengameart.org/sites/default/files/a_1.mp3')
export const sound_shield = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/spell3.wav.mp3')
export const sound_notAvailable = createSoundEffect('https://opengameart.org/sites/default/files/Metal%20Click.mp3')
export const sound_setback = createSoundEffect('https://opengameart.org/sites/default/files/game_over_bad_chest.mp3')

export const sound_hitting = createSoundEffect('https://opengameart.org/sites/default/files/SFX_Jump_09_0.mp3', 0.25)
export const sound_monsterHit = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/hit01.wav.mp3')
export const sound_monsterBite = createSoundEffect('https://opengameart.org/sites/default/files/k1.mp3')
export const sound_monsterDie = createSoundEffect('https://opengameart.org/sites/default/files/audio_preview/mutantdie.wav.mp3')

function createSoundEffect(source, volume = 1) {
  const soundEffect = new Audio(source)
  soundEffect.volume = volume
  
  return () => {
    if (soundEffect.paused) {
      soundEffect.play()
    } else {
      soundEffect.currentTime = 0
    }
  }
}