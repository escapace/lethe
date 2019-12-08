import {
  map,
  isFunction,
  isArray,
  isNumber,
  every,
  isString,
  find,
  isBoolean,
  isNull
} from 'lodash'
import { assert } from '../assert'
import { Options, builder } from '@escapace/fluent'
import { SYMBOL_KEYFRAME_LIST } from '../types'

import {
  Settings,
  State,
  Actions,
  TypeAction,
  ActionName,
  KeyframesNumberArray,
  KeyframesNumber,
  ActionKeyframes,
  TypeKeyframes,
  KeyframesString,
  KeyframesBoolean
} from './types'

export const reducer = (log: Actions[]): State => {
  const name = (find(log, action => action.type === TypeAction.Name) as
    | ActionName
    | undefined)?.payload

  return {
    type: SYMBOL_KEYFRAME_LIST,
    isEmpty:
      log.length === 0 || every(log, action => action.type === TypeAction.Name),
    name
  }
}

export const list = builder<Settings>([
  {
    [Options.Type]: TypeAction.Name,
    [Options.Once]: true,
    [Options.Keys]: ['name'],
    [Options.Reducer]: reducer,
    [Options.Interface]: dispatch => ({
      name(name: string) {
        assert.string(name)

        return dispatch<ActionName>({
          type: TypeAction.Name,
          payload: name
        })
      }
    })
  },
  {
    [Options.Type]: TypeAction.Keyframes,
    [Options.Once]: false,
    [Options.Keys]: ['number', 'boolean', 'string'],
    [Options.Dependencies]: [TypeAction.Name],
    [Options.Reducer]: reducer,
    [Options.Interface]: (dispatch, log) => ({
      number(name: string, keyframes: KeyframesNumberArray | KeyframesNumber) {
        assert.keyframeName(name, log)

        // TODO: Check array length on TypeKeyframes.NumberArray
        // TODO: easing validation

        const types = map(keyframes, keyframe => {
          const value = isFunction(keyframe)
            ? keyframe(0).value
            : keyframe.value

          return isArray(value)
            ? TypeKeyframes.NumberArray
            : isNumber(value)
            ? TypeKeyframes.Number
            : null
        })

        const type = every(types, t => t === TypeKeyframes.Number)
          ? TypeKeyframes.Number
          : every(types, t => t === TypeKeyframes.NumberArray)
          ? TypeKeyframes.NumberArray
          : null

        if (isNull(type)) {
          throw new Error('TODO:')
        }

        return dispatch<
          ActionKeyframes<TypeKeyframes.Number | TypeKeyframes.NumberArray>
        >({
          type: TypeAction.Keyframes,
          payload: {
            type,
            name,
            keyframes
          }
        })
      },
      string(name: string, keyframes: KeyframesString) {
        assert.keyframeName(name, log)

        const types = map(keyframes, keyframe => {
          const value = isFunction(keyframe)
            ? keyframe(0).value
            : keyframe.value

          return isString(value) ? TypeKeyframes.String : null
        })

        const type = every(types, t => t === TypeKeyframes.String)
          ? TypeKeyframes.String
          : null

        if (isNull(type)) {
          throw new Error('TODO:')
        }

        return dispatch<ActionKeyframes<TypeKeyframes.String>>({
          type: TypeAction.Keyframes,
          payload: {
            type,
            name,
            keyframes
          }
        })
      },
      boolean(name: string, keyframes: KeyframesBoolean) {
        assert.keyframeName(name, log)

        const types = map(keyframes, keyframe => {
          const value = isFunction(keyframe)
            ? keyframe(0).value
            : keyframe.value

          return isBoolean(value) ? TypeKeyframes.Boolean : null
        })

        const type = every(types, t => t === TypeKeyframes.Boolean)
          ? TypeKeyframes.Boolean
          : null

        if (isNull(type)) {
          throw new Error('TODO:')
        }

        return dispatch<ActionKeyframes<TypeKeyframes.Boolean>>({
          type: TypeAction.Keyframes,
          payload: {
            type,
            name,
            keyframes
          }
        })
      }
    })
  }
])
