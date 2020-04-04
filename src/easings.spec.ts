// import { hello } from './index'

// tslint:disable-next-line no-import-side-effect
import { assert } from 'chai'

import {
  linear,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  steps,
  spring,
  cubicBezier
} from './easings'

describe('./src/easings.spec.ts', () => {
  it('penner', () => {
    const easings = [
      linear,
      easeInSine,
      easeOutSine,
      easeInOutSine,
      easeInCirc,
      easeOutCirc,
      easeInOutCirc,
      easeInBack,
      easeOutBack,
      easeInOutBack,
      easeInBounce,
      easeOutBounce,
      easeInOutBounce,
      easeInElastic,
      easeOutElastic,
      easeInOutElastic,
      easeInQuad,
      easeOutQuad,
      easeInOutQuad,
      easeInCubic,
      easeOutCubic,
      easeInOutCubic,
      easeInQuart,
      easeOutQuart,
      easeInOutQuart,
      easeInQuint,
      easeOutQuint,
      easeInOutQuint,
      easeInExpo,
      easeOutExpo,
      easeInOutExpo
    ]

    easings.forEach((easing) => {
      // const fn =
      //   easing === 'cubicBezier' ? `cubicBezier(1, 1, 1, 1)` : `${easing}()`
      assert.isFunction(easing)
      assert.isFunction(easing())
      assert.ok(easing()(1) - 1 < Number.EPSILON)
    })
  })

  it('steps; cubicBezier; spring', () => {
    assert.isFunction(steps)
    assert.isFunction(cubicBezier)
    assert.isFunction(spring)
    const A = steps(10)
    const B = cubicBezier(1, 1, 1, 1)
    const C = spring(10, 10, 10)
    ;[A, B, C].forEach((easing) => {
      assert.isFunction(easing)
      assert.ok(easing(1) - 1 < Number.EPSILON)
    })
  })
})
