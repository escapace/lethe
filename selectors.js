import crypto from 'crypto'
import lerp from 'lerp-array'
import {
  isUndefined,
  assign,
  cloneDeep,
  forEach,
  isFunction,
  merge,
  map,
  isString,
  range,
  sortBy,
  sortedIndex
} from 'lodash'
import {} from 'util'
import { parseEasings } from './easings'

// const SYMBOL_PROPERTY = Symbol.for('KEYFRAME_PROPERTY')
// const SYMBOL_GROUP = Symbol.for('KEYFRAME_GROUP')

const cascadeKeyframes = options => {
  const keyMap = new Map()
  const entries = cloneDeep(Array.from(options.keyframes.entries()))

  return map(range(0, options.loops), loop => {
    const properties = new Map()

    forEach(entries, ([progress, propertyGroups]) => [
      progress,
      forEach(propertyGroups, (propertyGroup, groupName) => {
        forEach(propertyGroup, (property, propertyName) => {
          const result = assign(
            {},
            property,
            {
              value: isFunction(property.value)
                ? property.value(loop)
                : property.value,
              easing: isString(property.easing)
                ? parseEasings(property.easing, 100)
                : isFunction(property.easing)
                ? property.easing
                : t => t
            }
            // {
            //   [SYMBOL_GROUP]: groupName,
            //   [SYMBOL_PROPERTY]: propertyName
            // }
          )

          const key = crypto
            .createHash('sha256')
            .update(`${groupName}/${propertyName}`)
            .digest('hex')

          keyMap.set(key, [groupName, propertyName])

          if (properties.has(key)) {
            const indice = properties.get(key)

            indice.set(progress, result)
          } else {
            properties.set(key, new Map())

            const indice = properties.get(key)

            indice.set(progress, result)
          }
        })
      })
    ])

    const mappedProperties = new Map()

    properties.forEach((value, key) => {
      const arr = cloneDeep(Array.from(value.entries()))

      mappedProperties.set(keyMap.get(key), sortBy(arr, [value => value[0]]))
    })

    return Array.from(mappedProperties.entries())
  })
}

const keyframeProduct = ([groupName, propertyName], value) => {
  return {
    [groupName]: {
      [propertyName]: value
    }
  }
}

export const selectorKeyframe = options => {
  const properties = cascadeKeyframes(options)

  return (prog, loop = 0) => {
    if (prog > 100) {
      prog = 100
    }

    return merge(
      {},
      ...map(properties[loop], ([key, encounters]) => {
        if (encounters.length === 1 || prog === 0) {
          return keyframeProduct(key, encounters[0][1].value)
        }

        const index = sortedIndex(
          map(encounters, enc => enc[0]),
          prog
        )

        if (isUndefined(encounters[index])) {
          return keyframeProduct(key, encounters[index - 1][1].value)
        }

        const [nextIndex, nextContent] = encounters[index]
        const [previousIndex, previousContent] = encounters[index - 1]

        if (nextContent.type === 'number') {
          const alpha = previousContent.easing(
            (prog - previousIndex) / (nextIndex - previousIndex)
          )

          return keyframeProduct(
            key,
            lerp(previousContent.value, nextContent.value, alpha)
          )
        } else {
          return keyframeProduct(key, previousContent.value)
        }
      })
    )
  }
}
