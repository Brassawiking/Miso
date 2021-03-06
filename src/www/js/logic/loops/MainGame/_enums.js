export const actionTypes = [
  'land_raise',
  'land_lower',
  'land_even',
  'land_fixed',
  'paint',
  'prop_add',
  'prop_remove',
  'reset'
]

export const landTypes = [
  'sand',
  'dirt',
  'rock',
  'grass',
  'lava',
].sort((a, b) => a.localeCompare(b))

export const propTypes = [
  'tree',
  'bush',
  'stone_tablet',
  'person',
  'person_red',
  'person_green',
  'person_blue',
  'person_yellow',
  'person_purple',
  'person_cyan',
  'person_white',
  'person_black',
  'pole_vertical',
  'pole_horizontal',
  'fence',
  'crystal',
  'house_roof',
  'house_wall',
  'steps',
  'chest',
  'campfire',
].sort((a, b) => a.localeCompare(b))
