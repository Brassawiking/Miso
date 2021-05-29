import { createRender_Prop } from './_Prop.js'

export function createRender_Person(clothColor = [1, 0, 0, 1]) {
  const leg = 0.4
  const cloth = 0.6
  const neck = 1.8
  const face = 0.5
  const footing = -0.05

  const mesh = [
    0, leg, -cloth/3,
    -cloth, leg, cloth,
    0, neck, 0,

    0, leg, -cloth/3,
    cloth, leg, cloth,
    0, neck, 0,

    0, neck, 0,
    cloth, leg, cloth,
    -cloth, leg, cloth,

    0, neck, 0,
    -face/2, neck+face, 0,
    face/2, neck+face, 0,

    0, neck, 0,
    0, neck+face, face/1.5,
    -face/2, neck+face, 0,

    0, neck, 0,
    0, neck+face, face/1.5,
    face/2, neck+face, 0,

    0, neck+face, face/1.5,
    -face/2, neck+face, 0,
    face/2, neck+face, 0,

    0, leg, cloth/2,
    -cloth/4, footing, cloth/3,
    -cloth/2, leg, cloth/3,

    0, leg, cloth/2,
    cloth/4, footing, cloth/3,
    cloth/2, leg, cloth/3,

    -0.03, neck+(face/2), 0,
    -face/4-0.03, neck+(face/2)+0.1, -0.001,
    -0.03, neck+(face/2)+0.1, -0.001,

    0.03, neck+(face/2), 0,
    face/4+0.03, neck+(face/2)+0.1, -0.001,
    0.03, neck+(face/2)+0.1, -0.001,
  ]

  const up = [0, 1, 0]
  const left = [-1, 0, 0]
  const right = [1, 0, 0]
  const front = [0, 1, -1]
  const back = [0, 1, 1]
  const normals = [
    ...front,
    ...left,
    ...front,

    ...front,
    ...right,
    ...front,

    ...back,
    ...back,
    ...back,

    ...front,
    ...front,
    ...front,

    ...back,
    ...back,
    ...back,

    ...back,
    ...back,
    ...back,

    ...up,
    ...up,
    ...up,

    ...front,
    ...front,
    ...front,

    ...front,
    ...front,
    ...front,

    ...front,
    ...front,
    ...front,

    ...front,
    ...front,
    ...front,
  ]

  const faceColor = [1, 0.8, 0.2, 1]
  const hairColor = [1, 0.5, 0, 1]
  const legColor = [0, 0, 0, 1]
  const eyeColor = [0, 0, 0, 1]
  const colors = [
    ...clothColor,
    ...clothColor,
    ...clothColor,

    ...clothColor,
    ...clothColor,
    ...clothColor,

    ...clothColor,
    ...clothColor,
    ...clothColor,

    ...faceColor,
    ...faceColor,
    ...faceColor,

    ...hairColor,
    ...hairColor,
    ...hairColor,

    ...hairColor,
    ...hairColor,
    ...hairColor,

    ...hairColor,
    ...hairColor,
    ...hairColor,

    ...legColor,
    ...legColor,
    ...legColor,

    ...legColor,
    ...legColor,
    ...legColor,

    ...eyeColor,
    ...eyeColor,
    ...eyeColor,

    ...eyeColor,
    ...eyeColor,
    ...eyeColor,
 ]

  return createRender_Prop(mesh, normals, colors)
}