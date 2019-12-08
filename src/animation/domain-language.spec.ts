import { animation } from './domain-language'

import { SYMBOL_LOG, SYMBOL_STATE, log, state } from '@escapace/fluent'
import { assert } from 'chai'
import { SYMBOL_ANIMATION } from '../types'
import { TypeAction, ActionKeyframeList } from './types'
import { list } from '../keyframe-list/domain-language'
import { Simple, simple } from '../simple'
import { easeInExpo, linear } from '../easings'

describe('animation', () => {
  it('empty', () => {
    assert.isFunction(animation)

    const test = animation()

    const _log: never[] = log(test)

    const _state: {
      isEmpty: true
      type: typeof SYMBOL_ANIMATION
    } = state(test)

    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE, 'add'])

    assert.deepEqual(_log, [])

    assert.deepEqual(_state, {
      type: SYMBOL_ANIMATION,
      isEmpty: true
    })
  })

  it('add()', () => {
    const listA = list()
      .name('abc')
      .number('number', {
        0: { value: 0 },
        100: { value: 100 }
      })

    const listB = list()
      .name('abc')
      .boolean('number', {
        0: { value: true },
        100: { value: false }
      })

    const test = animation()
      .add(listA)
      .add(listB)

    const _log: Array<
      | ActionKeyframeList<Simple<typeof listA>>
      | ActionKeyframeList<Simple<typeof listB>>
    > = log(test)

    const _state: {
      isEmpty: false
      type: typeof SYMBOL_ANIMATION
    } = state(test)

    assert.hasAllKeys(test, [SYMBOL_LOG, SYMBOL_STATE, 'add', 'reduce'])

    assert.deepEqual(_log, [
      {
        type: TypeAction.KeyframeList,
        payload: simple(listB)
      },
      {
        type: TypeAction.KeyframeList,
        payload: simple(listA)
      }
    ])

    assert.deepEqual(_state, {
      type: SYMBOL_ANIMATION,
      isEmpty: false
    })
  })

  it('reduce()', () => {
    assert.isFunction(animation)

    const listA = list()
      .name('A')
      .number('number', {
        0: { value: 0, easing: easeInExpo() },
        50: { value: 50, easing: linear() },
        100: { value: 100 }
      })

    const listB = list()
      .name('B')
      .number('number', {
        0: iteration => ({
          value: [0, 15, 30].map(n => n * (iteration + 1)),
          easing: easeInExpo()
        }),
        50: iteration => ({
          value: [15, 30, 45].map(n => n * (iteration + 1)),
          easing: linear()
        })
      })

    const test = animation()
      .add(listA)
      .add(listB)
      .reduce({
        iterations: 2
      })

    assert.isFunction(test)

    assert.deepEqual(Array.from(test()), [
      ['A', { number: 0 }],
      ['B', { number: [0, 15, 30] }]
    ])

    assert.deepEqual(Array.from(test(50)), [
      ['A', { number: 50 }],
      ['B', { number: [15, 30, 45] }]
    ])

    assert.deepEqual(Array.from(test(75)), [
      ['A', { number: 75 }],
      ['B', { number: [15, 30, 45] }]
    ])

    assert.deepEqual(test(75).A, { number: 75 })
    assert.deepEqual(test(75).B, { number: [15, 30, 45] })

    assert.deepEqual(Array.from(test(45)), [
      [
        'A',
        {
          number: 26.572050000000004
        }
      ],
      [
        'B',
        {
          number: [7.971615000000001, 22.971615, 37.971615]
        }
      ]
    ])

    assert.deepEqual(test(75, 1).B, { number: [15, 30, 45].map(n => n * 2) })
  })

  it('reduce() ; single keyframe', () => {
    assert.isFunction(animation)

    const listA = list()
      .name('A')
      .number('number', {
        50: { value: 50, easing: linear() }
      })

    const test = animation()
      .add(listA)
      .reduce()

    assert.deepEqual(Array.from(test(0)), [['A', { number: 50 }]])
    assert.deepEqual(Array.from(test(100)), [['A', { number: 50 }]])
    assert.deepEqual(Array.from(test(75)), [['A', { number: 50 }]])
  })
})
