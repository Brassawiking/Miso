import { v4 as uuidv4 } from 'uuid'


// Public 

/*

Ligger på disk
Uppläst i minnescache
Dangling referenser

Entity:
  - En json-fil med uuid som filnamn
  - 

*/

const entities = {}


class PersistentEntity {
  constructor(schema) {
    this.id = uuidv4()
    this.created = Date.now()
    this.updated = this.created

    for (let key in schema) {
      let type = schema[key]

      if (Array.isArray(type)) {
        type = type[0]
        if (type.prototype instanceof PersistentEntity) {
          console.log('Array Persistent', type, key)
        } else {
          console.log('Array Primitive', type, key)
        }
      } else if (type.prototype instanceof PersistentEntity) {
        console.log('Persistent', type, key)
      } else {
        console.log('Primitive', type, key)
      }
    }


    Object.preventExtensions(this)
  }
}


class User extends PersistentEntity {
  constructor() {
    super({
      name: String
    })
  }
}

class Realm extends PersistentEntity {
  constructor() {
    super({
      name: String,
      owner: User,
      rootLand: Land,
    })
  }
}

class Land extends PersistentEntity {
  constructor() {
    super({
      name: String,
      owner: User,
      realm: Realm,
      borderLands: [Land]
    })
  }
}

var x = new Land()

console.log(x instanceof PersistentEntity)
console.log(Land.prototype instanceof PersistentEntity)