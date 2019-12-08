import { list } from './domain-language'
import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_KEYFRAME_LIST } from '../types'
import { ActionName, TypeAction, ActionKeyframes, TypeKeyframes } from './types'

describe('keyframe-list', () => {
  it('empty', () => {
    assert.isFunction(list)

    const test = list()

    const _log: never[] = log(test)

    const _state: {
      isEmpty: true
      name: undefined
      type: typeof SYMBOL_KEYFRAME_LIST
    } = state(test)

    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE, 'name'])

    assert.deepEqual(_log, [])

    assert.deepEqual(_state, {
      type: SYMBOL_KEYFRAME_LIST,
      name: undefined,
      isEmpty: true
    })
  })

  it('name()', () => {
    assert.isFunction(list)

    const test = list().name('test')

    const _log: Array<ActionName<'test'>> = log(test)

    const _state: {
      isEmpty: true
      name: 'test'
      type: typeof SYMBOL_KEYFRAME_LIST
    } = state(test)

    assert.hasAllKeys(test, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'boolean',
      'number',
      'string'
    ])

    assert.deepEqual(_log, [
      {
        type: TypeAction.Name,
        payload: 'test'
      }
    ])

    assert.deepEqual(_state, {
      type: SYMBOL_KEYFRAME_LIST,
      name: 'test',
      isEmpty: true
    })
  })

  it('number()', () => {
    assert.isFunction(list)

    const test = list()
      .name('test')
      .number('abc', {
        0: { value: 0 },
        100: { value: 100 }
      })
      .number('zxc', {
        0: { value: 90 },
        50: { value: 50 },
        100: { value: 10 }
      })
      .number('qwe', {
        0: { value: [1, 2, 3] },
        100: { value: [10, 20, 30] }
      })

    const _log: Array<
      | ActionName<'test'>
      | ActionKeyframes<TypeKeyframes.Number>
      | ActionKeyframes<TypeKeyframes.NumberArray>
    > = log(test)

    const _state: {
      isEmpty: false
      name: 'test'
      type: typeof SYMBOL_KEYFRAME_LIST
    } = state(test)

    assert.hasAllKeys(test, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'boolean',
      'number',
      'string'
    ])

    assert.deepEqual(_log, [
      {
        type: TypeAction.Keyframes,
        payload: {
          type: TypeKeyframes.NumberArray,
          name: 'qwe',
          keyframes: {
            0: { value: [1, 2, 3] },
            100: { value: [10, 20, 30] }
          }
        }
      },
      {
        type: TypeAction.Keyframes,
        payload: {
          type: TypeKeyframes.Number,
          name: 'zxc',
          keyframes: {
            0: { value: 90 },
            50: { value: 50 },
            100: { value: 10 }
          }
        }
      },
      {
        type: TypeAction.Keyframes,
        payload: {
          type: TypeKeyframes.Number,
          name: 'abc',
          keyframes: {
            0: { value: 0 },
            100: { value: 100 }
          }
        }
      },
      {
        type: TypeAction.Name,
        payload: 'test'
      }
    ])

    assert.deepEqual(_state, {
      type: SYMBOL_KEYFRAME_LIST,
      name: 'test',
      isEmpty: false
    })
  })

  it('boolean() / string()', () => {
    assert.isFunction(list)

    const test = list()
      .name('test')
      .boolean('abc', {
        0: { value: true },
        100: { value: false }
      })
      .string('zxc', {
        0: { value: 'a' },
        50: { value: 'b' },
        100: { value: 'c' }
      })

    const _log: Array<
      | ActionName<'test'>
      | ActionKeyframes<TypeKeyframes.Boolean>
      | ActionKeyframes<TypeKeyframes.String>
    > = log(test)

    const _state: {
      isEmpty: false
      name: 'test'
      type: typeof SYMBOL_KEYFRAME_LIST
    } = state(test)

    assert.hasAllKeys(test, [
      SYMBOL_LOG,
      SYMBOL_STATE,
      'boolean',
      'number',
      'string'
    ])

    assert.deepEqual(_log, [
      {
        type: TypeAction.Keyframes,
        payload: {
          type: TypeKeyframes.String,
          name: 'zxc',
          keyframes: {
            0: { value: 'a' },
            50: { value: 'b' },
            100: { value: 'c' }
          }
        }
      },
      {
        type: TypeAction.Keyframes,
        payload: {
          type: TypeKeyframes.Boolean,
          name: 'abc',
          keyframes: {
            0: { value: true },
            100: { value: false }
          }
        }
      },
      {
        type: TypeAction.Name,
        payload: 'test'
      }
    ])

    assert.deepEqual(_state, {
      type: SYMBOL_KEYFRAME_LIST,
      name: 'test',
      isEmpty: false
    })
  })
})
