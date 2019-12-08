import {
  noop,
  isString,
  isInteger,
  isArray,
  every,
  some,
  isNumber
} from 'lodash'
import {
  KeyframeList,
  ActionKeyframes,
  TypeAction
} from './keyframe-list/types'
import { simple } from './simple'
import { SYMBOL_STATE, Action } from '@escapace/fluent'
import { SYMBOL_KEYFRAME_LIST } from './types'

const NODE_ENV = process.env.NODE_ENV

function ok(condition: boolean, message: string): asserts condition {
  if (!condition) {
    const error = new Error(message)
    error.name = 'Assertion Error'

    throw error
  }
}

const assertions = {
  ok,
  string(value: unknown): asserts value is string {
    ok(isString(value), 'TODO:')
  },
  list(value: unknown): asserts value is KeyframeList {
    const state = simple(value as KeyframeList)[SYMBOL_STATE]

    ok(state.type === SYMBOL_KEYFRAME_LIST && state.isEmpty === false, 'TODO:')
  },
  iterations(value: unknown): asserts value is number | number[] {
    if (isArray(value)) {
      ok(
        every(value, num => isInteger(num)),
        'TODO:'
      )
    } else {
      ok(isInteger(value), 'TODO:')
    }
  },
  keyframeName(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: Array<Action<TypeAction, any>>
  ): asserts value is number | number[] {
    ok(
      isString(value) &&
        !some(
          log,
          action =>
            action.type === TypeAction.Keyframes &&
            (action as ActionKeyframes).payload.name === value
        ),
      'TODO:'
    )
  },
  number(value: unknown): asserts value is number {
    ok(isNumber(value), 'TODO:')
  }
}

export const assert: typeof assertions =
  NODE_ENV !== 'production'
    ? assertions
    : Object.assign(
        {},
        ...Object.keys(assertions).map(name => ({ [name]: noop }))
      )
