import { createRender_Person } from '../renders/props/Person.js'

export function createRender_PlayerModel(gl) {
  return createRender_Person(gl, [1.0, 0, 1.0, 1.0])
}