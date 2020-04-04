import { isUndefined } from 'lodash'

type Easing = (...parameters: number[]) => (t: number) => number

const minMax = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max)
}

type PennerEasings =
  | 'linear'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'

const penner = (() => {
  // Based on jQuery UI's implemenation of easing equations from Robert Penner
  // (http://www.robertpenner.com/easing)

  const eases: Record<string, Easing> = { linear: () => (t) => t }

  const functionEasings: Record<string, Easing> = {
    Sine: () => (t) => 1 - Math.cos((t * Math.PI) / 2),
    Circ: () => (t) => 1 - Math.sqrt(1 - t * t),
    Back: () => (t) => t * t * (3 * t - 2),
    Bounce: () => (t) => {
      let pow2
      let b = 4
      // eslint-disable-next-line no-empty
      while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return (
        1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2)
      )
    },
    Elastic: (amplitude = 1, period = 0.5) => {
      const a = minMax(amplitude, 1, 10)
      const p = minMax(period, 0.1, 2)
      return (t) => {
        return t === 0 || t === 1
          ? t
          : -a *
              Math.pow(2, 10 * (t - 1)) *
              Math.sin(
                ((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) *
                  (Math.PI * 2)) /
                  p
              )
      }
    }
  }

  const baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo']

  baseEasings.forEach((name, i) => {
    functionEasings[name] = () => (t) => Math.pow(t, i + 2)
  })

  Object.keys(functionEasings).forEach((name) => {
    const easeIn = functionEasings[name]
    eases['easeIn' + name] = easeIn
    eases['easeOut' + name] = (a, b) => (t) => 1 - easeIn(a, b)(1 - t)
    eases['easeInOut' + name] = (a, b) => (t) =>
      t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2
  })

  return eases as Record<PennerEasings, Easing>
})()

// Basic steps easing implementation
// https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

export const steps = (steps = 10) => (t: number) =>
  Math.round(t * steps) * (1 / steps)

// BezierEasing https://github.com/gre/bezier-easing

export const cubicBezier = (() => {
  const kSplineTableSize = 11
  const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0)

  function A(aA1: number, aA2: number) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1
  }
  function B(aA1: number, aA2: number) {
    return 3.0 * aA2 - 6.0 * aA1
  }
  function C(aA1: number) {
    return 3.0 * aA1
  }

  function calcBezier(aT: number, aA1: number, aA2: number) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT
  }
  function getSlope(aT: number, aA1: number, aA2: number) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1)
  }

  function binarySubdivide(
    aX: number,
    aA: number,
    aB: number,
    mX1: number,
    mX2: number
  ) {
    let currentX
    let currentT
    let i = 0

    do {
      currentT = aA + (aB - aA) / 2.0
      currentX = calcBezier(currentT, mX1, mX2) - aX
      if (currentX > 0.0) {
        aB = currentT
      } else {
        aA = currentT
      }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10)
    return currentT
  }

  function newtonRaphsonIterate(
    aX: number,
    aGuessT: number,
    mX1: number,
    mX2: number
  ) {
    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, mX1, mX2)
      if (currentSlope === 0.0) return aGuessT
      const currentX = calcBezier(aGuessT, mX1, mX2) - aX
      aGuessT -= currentX / currentSlope
    }
    return aGuessT
  }

  function bezier(mX1: number, mY1: number, mX2: number, mY2: number) {
    if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
      throw new Error('Not valid bezzier curve')
    }

    const sampleValues = new Float32Array(kSplineTableSize)

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (let i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2)
      }
    }

    function getTForX(aX: number) {
      let intervalStart = 0
      let currentSample = 1
      const lastSample = kSplineTableSize - 1

      for (
        ;
        currentSample !== lastSample && sampleValues[currentSample] <= aX;
        ++currentSample
      ) {
        intervalStart += kSampleStepSize
      }

      --currentSample

      const dist =
        (aX - sampleValues[currentSample]) /
        (sampleValues[currentSample + 1] - sampleValues[currentSample])
      const guessForT = intervalStart + dist * kSampleStepSize
      const initialSlope = getSlope(guessForT, mX1, mX2)

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2)
      } else if (initialSlope === 0.0) {
        return guessForT
      } else {
        return binarySubdivide(
          aX,
          intervalStart,
          intervalStart + kSampleStepSize,
          mX1,
          mX2
        )
      }
    }

    return (x: number) => {
      if (mX1 === mY1 && mX2 === mY2) return x
      if (x === 0 || x === 1) return x

      return calcBezier(getTForX(x), mY1, mY2)
    }
  }

  return bezier
})()

export const spring = (...parameters: number[]) => {
  // const parameters = parseEasingParameters(parameters)
  const mass = minMax(isUndefined(parameters[0]) ? 1 : parameters[0], 0.1, 100)
  const stiffness = minMax(
    isUndefined(parameters[1]) ? 100 : parameters[1],
    0.1,
    100
  )
  const damping = minMax(
    isUndefined(parameters[2]) ? 10 : parameters[2],
    0.1,
    100
  )
  const velocity = minMax(
    isUndefined(parameters[3]) ? 0 : parameters[3],
    0.1,
    100
  )
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0
  const a = 1
  const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0

  const solver = (t: number) => {
    let progress = t

    if (zeta < 1) {
      progress =
        Math.exp(-progress * zeta * w0) *
        (a * Math.cos(wd * progress) + b * Math.sin(wd * progress))
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0)
    }
    if (t === 0 || t === 1) return t

    return 1 - progress
  }

  return solver
}

export const linear = penner.linear
export const easeInSine = penner.easeInSine
export const easeOutSine = penner.easeOutSine
export const easeInOutSine = penner.easeInOutSine
export const easeInCirc = penner.easeInCirc
export const easeOutCirc = penner.easeOutCirc
export const easeInOutCirc = penner.easeInOutCirc
export const easeInBack = penner.easeInBack
export const easeOutBack = penner.easeOutBack
export const easeInOutBack = penner.easeInOutBack
export const easeInBounce = penner.easeInBounce
export const easeOutBounce = penner.easeOutBounce
export const easeInOutBounce = penner.easeInOutBounce
export const easeInElastic = penner.easeInElastic
export const easeOutElastic = penner.easeOutElastic
export const easeInOutElastic = penner.easeInOutElastic
export const easeInQuad = penner.easeInQuad
export const easeOutQuad = penner.easeOutQuad
export const easeInOutQuad = penner.easeInOutQuad
export const easeInCubic = penner.easeInCubic
export const easeOutCubic = penner.easeOutCubic
export const easeInOutCubic = penner.easeInOutCubic
export const easeInQuart = penner.easeInQuart
export const easeOutQuart = penner.easeOutQuart
export const easeInOutQuart = penner.easeInOutQuart
export const easeInQuint = penner.easeInQuint
export const easeOutQuint = penner.easeOutQuint
export const easeInOutQuint = penner.easeInOutQuint
export const easeInExpo = penner.easeInExpo
export const easeOutExpo = penner.easeOutExpo
export const easeInOutExpo = penner.easeInOutExpo
