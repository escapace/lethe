import { assert } from '../assert'
import {
  Options,
  builder,
  Action,
  SYMBOL_STATE,
  SYMBOL_LOG
} from '@escapace/fluent'
import { SYMBOL_ANIMATION } from '../types'
import {
  Settings,
  State,
  AnimationKeyMap,
  AnimationData,
  TypeAction,
  ActionKeyframeList,
  ReducerOptions
} from './types'
import {
  KeyframeList,
  TypeAction as ListTypeAction,
  ActionKeyframes,
  TypeKeyframes,
  Easing
} from '../keyframe-list/types'
import { simple } from '../simple'

import {
  entries,
  filter,
  flatMap,
  forEach,
  fromPairs,
  includes,
  isFunction,
  isNumber,
  // isString,
  isUndefined,
  map,
  // mapValues,
  merge,
  range,
  reverse,
  sortBy,
  sortedIndex
} from 'lodash-es'
import lerpArray from 'lerp-array'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reducer = (log: Array<Action<TypeAction, any>>): State => {
  return {
    type: SYMBOL_ANIMATION,
    isEmpty: log.length === 0
  }
}

const animationData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: Array<Action<TypeAction, any>>,
  options: { iterations: number[] }
) => {
  const keyMap = new Map<string, AnimationKeyMap>()

  const listNames: Set<string> = new Set()

  const _log = flatMap(
    reverse(
      filter(
        log,
        ({ type }) => type === TypeAction.KeyframeList
      ) as ActionKeyframeList[]
    ),
    (listAction, listIndex) => {
      const listName = listAction.payload[SYMBOL_STATE].name

      if (listNames.has(listName)) {
        throw new Error('TODO:')
      } else {
        listNames.add(listName)
      }

      return flatMap(
        reverse(
          filter(
            listAction.payload[SYMBOL_LOG],
            ({ type }) => type === ListTypeAction.Keyframes
          ) as ActionKeyframes[]
        ),
        (propertyAction, propertyIndex) => {
          const propertyName = propertyAction.payload.name
          const propertyType = propertyAction.payload.type

          const propertyInterpolation = isFunction(
            propertyAction.payload.interpolation
          )
            ? propertyAction.payload.interpolation
            : includes(
                [TypeKeyframes.Number, TypeKeyframes.NumberArray],
                propertyType
              )
            ? lerpArray
            : (x: any) => x

          const keyData = {
            listName,
            propertyName,
            listIndex,
            propertyIndex,
            propertyType,
            propertyInterpolation
          }

          const key = `${listName}${propertyName}`

          keyMap.set(key, keyData)

          const keyframes = propertyAction.payload.keyframes

          return { keyData, keyframes, key }
        }
      )
    }
  )

  const data = fromPairs(
    map(options.iterations, (iteration) => {
      const properties = new Map<
        string,
        Map<
          number,
          {
            value: boolean | string | number | number[]
            easing?: Easing
          }
        >
      >()

      forEach(_log, ({ keyframes, key }) => {
        forEach(keyframes, (frame, progress) => {
          let indice

          if (properties.has(key)) {
            indice = properties.get(key)
          } else {
            properties.set(key, new Map())
            indice = properties.get(key)
          }

          const kf = isFunction(frame) ? frame(iteration) : frame

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          indice!.set(Number.parseFloat(progress), kf)
        })
      })

      const mappedProperties: Map<
        AnimationKeyMap,
        Array<
          [
            number,
            {
              value: string | number | boolean | number[]
              easing?: string | Function | undefined
            }
          ]
        >
      > = new Map()

      properties.forEach((value, key) => {
        const arr = Array.from(value.entries())

        mappedProperties.set(
          keyMap.get(key) as AnimationKeyMap,
          sortBy(arr, [(value) => value[0]])
        )
      })

      return [iteration, Array.from(mappedProperties.entries())]
    })
  ) as AnimationData

  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const keyframeProduct = (keyMap: AnimationKeyMap, value: any) => {
  return {
    [keyMap.listName]: {
      [keyMap.propertyName]: value
    }
  }
}

export const animation = builder<Settings>([
  {
    [Options.Type]: TypeAction.KeyframeList,
    [Options.Once]: false,
    [Options.Keys]: ['add'],
    [Options.Reducer]: reducer,
    [Options.Interface]: (dispatch) => ({
      add(value: KeyframeList) {
        assert.list(value)

        // TODO: duplicate name test

        return dispatch<ActionKeyframeList>({
          type: TypeAction.KeyframeList,
          payload: simple(value)
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Reduce,
    [Options.Once]: false,
    [Options.Dependencies]: [TypeAction.KeyframeList],
    [Options.Keys]: ['reduce'],
    [Options.Reducer]: reducer,
    [Options.Interface]: (_, log) => ({
      reduce(options?: ReducerOptions) {
        let iterations: number[]

        if (isUndefined(options?.iterations)) {
          iterations = [0]
        } else {
          assert.iterations(options?.iterations)

          iterations = isNumber(options?.iterations)
            ? range(0, options?.iterations)
            : options?.iterations
        }

        const data = animationData(log, { iterations })

        // listNames.
        // console.log()

        return (progress = 0, iteration = 0) => {
          if (progress > 100) {
            progress = 100
          }

          // console.log(data[0])

          const object = merge(
            {},
            ...map(data[iteration], ([keyMap, encounters]) => {
              const interpolation = keyMap.propertyInterpolation as (
                ...args: any[]
              ) => any

              if (encounters.length === 1 || progress === 0) {
                return keyframeProduct(
                  keyMap,
                  interpolation(
                    encounters[0][1].value,
                    encounters[0][1].value,
                    0
                  )
                )
              }

              const index = sortedIndex(
                map(encounters, (enc) => enc[0]),
                progress
              )

              if (isUndefined(encounters[index])) {
                return keyframeProduct(
                  keyMap,
                  interpolation(
                    encounters[index - 1][1].value,
                    encounters[index - 1][1].value,
                    0
                  )
                )
              }

              const [nextIndex, nextContent] = encounters[index]
              const [previousIndex, previousContent] = encounters[index - 1]

              if (
                includes(
                  [TypeKeyframes.Number, TypeKeyframes.NumberArray],
                  keyMap.propertyType
                )
              ) {
                const alpha =
                  (progress - previousIndex) / (nextIndex - previousIndex)

                return keyframeProduct(
                  keyMap,
                  interpolation(
                    previousContent.value as number,
                    nextContent.value as number,
                    isFunction(previousContent.easing)
                      ? previousContent.easing(alpha)
                      : alpha
                  )
                )
              } else {
                return keyframeProduct(keyMap, previousContent.value)
              }
            })
          )

          return Object.assign(object, {
            [Symbol.iterator]: () => entries(object)[Symbol.iterator]()
          })
        }
      }
    })
  }
])

// import { list } from '../keyframe-list/domain-language'

// const qwe = animation()
//   .add(
//     list()
//       .name('listA')
//       .number('listA0', {
//         0: () => ({ value: 1 }),
//         100: { value: 30 }
//       })
//       .number('listA1', {
//         0: () => ({ value: 1 }),
//         100: { value: 50 }
//       })
//       .string('listA2', {
//         0: () => ({ value: 'qwe' }),
//         100: () => ({ value: 'abcd' })
//       })
//   )
//   .add(
//     list()
//       .name('listB')
//       .number('listB0', {
//         0: () => ({ value: [0, 0], easing: 'easeInSine()' }),
//         100: () => ({ value: [79, 12] })
//       })
//       .boolean('listB1', {
//         0: { value: true },
//         100: { value: false }
//       })
//   )
//   .reduce()

// const iter = Array.from(qwe())
// console.log(iter)
