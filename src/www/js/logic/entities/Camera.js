import { v3, m4 } from '../../common/math.js'

export class Camera {

  constructor() {
    this.position = [0, 0, 0]
    this.target = [0, 0, 1]
    this.up = [0, 1, 0]
    this.near = 1
    this.far = 10
    this.aspect = 1
    this.matrix = m4.identity()

    this.update()
  }

  update() {
    const cameraPosition = this.position
    const cameraTarget = this.target
    const up = this.up
    const near = this.near
    const far = this.far
    const aspectRatio = this.aspect

    const cameraZ = v3.normalize(v3.subtract(cameraTarget, cameraPosition))
    const cameraX = v3.normalize(v3.cross(up, cameraZ))
    const cameraY = v3.normalize(v3.cross(cameraZ, cameraX))

    const worldX = [1, 0, 0]
    const worldY = [0, 1, 0]
    const worldZ = [0, 0, 1]

    const translation = [
      1.0, 0, 0, -cameraPosition[0],
      0, 1.0, 0, -cameraPosition[1],
      0, 0, 1.0, -cameraPosition[2],
      0, 0, 0, 1.0
    ]

    const rotation = [
      v3.dot(cameraX, worldX), v3.dot(cameraX, worldY), v3.dot(cameraX, worldZ), 0,
      v3.dot(cameraY, worldX), v3.dot(cameraY, worldY), v3.dot(cameraY, worldZ), 0,
      v3.dot(cameraZ, worldX), v3.dot(cameraZ, worldY), v3.dot(cameraZ, worldZ), 0,
      0, 0, 0, 1
    ]

    const projection = [
      1.0 / aspectRatio, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, (far + near) / (far - near), -(2.0 * far * near) / (far - near),
      0, 0, 1, 0
    ]
    
    this.x = cameraX
    this.y = cameraY
    this.z = cameraZ
    this.matrix = m4.multiply(projection, m4.multiply(rotation, translation))
  }
}