/* eslint-disable @typescript-eslint/no-explicit-any */
import $ from '@escapace/typelevel'
import { Action, FluentInterface, Model, Next, Options } from '@escapace/fluent'

import {
  KeyframeList,
  KeyframeListState,
  ActionKeyframes,
  Actions as ListActions,
  TypeKeyframes,
  // Interpolation,
  Easing
} from '../keyframe-list/types'

import { SYMBOL_ANIMATION } from '../types'
import { Simple } from '../simple'

export declare const ANIMATION_INTERFACE: unique symbol
export declare const ANIMATION_SPECIFICATION: unique symbol
export declare const ANIMATION_REDUCER: unique symbol

export enum TypeAction {
  KeyframeList,
  Reduce
}

export interface ActionKeyframeList<T extends KeyframeList = KeyframeList> {
  type: TypeAction.KeyframeList
  payload: T
}

export type Actions = ActionKeyframeList

type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

type ExtractValue<
  T,
  Q = T extends Record<string | number, infer U>
    ? U extends (...args: any) => infer R
      ? R
      : U
    : never
> = Q extends { value: infer V } ? V : never

type ToPairs<T> = {
  [P in keyof T]: [P, T[P]]
} extends Record<any, infer V>
  ? V
  : never

type AnimationProduct<T extends ActionKeyframes['payload']> = {
  [P1 in keyof T]: T['interpolation'] extends (...args: any) => any
    ? {
        [P4 in keyof T]: T[P4] extends (...args: any) => infer Z
          ? Record<$.Cast<T[P1], string>, Z>
          : never
      }[$.Cast<keyof T, 'interpolation'>]
    : {
        [P2 in keyof T]: Record<$.Cast<T[P1], string>, ExtractValue<T[P2]>>
      }[$.Cast<keyof T, 'keyframes'>]
}[$.Cast<keyof T, 'name'>]

export type ActionKeyframeListPayload<
  T extends Model<State, Actions>
> = T['log'] extends ActionKeyframeList<infer U>
  ? U extends FluentInterface<Model<infer S, infer A>>
    ? Model<$.Cast<S, KeyframeListState>, $.Cast<A, ListActions>>
    : never
  : never

export type ReducerLookup<
  T extends Model<State, Actions>
> = UnionToIntersection<
  T['log'] extends ActionKeyframeList<infer U>
    ? U extends FluentInterface<Model<infer S, infer A>>
      ? Record<
          $.Cast<S, KeyframeListState>['name'],
          UnionToIntersection<
            AnimationProduct<
              Extract<$.Cast<A, ListActions>, ActionKeyframes>['payload']
            >
          >
        >
      : never
    : never
>

export type Reducer<T extends Model<State, Actions>, U = ReducerLookup<T>> = (
  percentage?: number,
  iteration?: number
) => U & Iterable<ToPairs<U>>

export interface ReducerOptions {
  iterations?: number | number[]
}

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  add<U extends KeyframeList>(
    list: U
  ): Next<Settings, T, ActionKeyframeList<Simple<U>>>

  reduce(options?: ReducerOptions): Reducer<T>
}

export interface Settings {
  [Options.Interface]: typeof ANIMATION_INTERFACE
  [Options.Specification]: typeof ANIMATION_SPECIFICATION
  [Options.Reducer]: typeof ANIMATION_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State {
  type: typeof SYMBOL_ANIMATION
  isEmpty: boolean
}

export interface InitialState {
  type: typeof SYMBOL_ANIMATION
  isEmpty: true
}

export interface Specification<_ extends Model<State>> {
  [TypeAction.KeyframeList]: {
    [Options.Type]: typeof TypeAction.KeyframeList
    [Options.Once]: $.False
    [Options.Dependencies]: never
    [Options.Keys]: 'add'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Reduce]: {
    [Options.Type]: typeof TypeAction.Reduce
    [Options.Once]: $.True
    [Options.Dependencies]: typeof TypeAction.KeyframeList
    [Options.Keys]: 'reduce'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [ANIMATION_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [ANIMATION_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [ANIMATION_REDUCER]: StateReducer<$.Cast<A, Action>>
  }
}

export interface StateReducer<_ extends Action> {
  [TypeAction.KeyframeList]: { isEmpty: false }
  [TypeAction.Reduce]: {}
}

export interface AnimationState extends State {
  isEmpty: false
}

export interface Animation extends FluentInterface<Model<Animation, Actions>> {}

export interface AnimationKeyMap {
  listName: string
  propertyName: string
  listIndex: number
  propertyIndex: number
  propertyType: TypeKeyframes
  propertyInterpolation: ((...args: any[]) => any) | undefined
}

export interface AnimationData {
  [key: number]: Array<
    [
      AnimationKeyMap,
      Array<
        [
          number,
          {
            value: string | number | boolean | number[]
            easing?: Easing
          }
        ]
      >
    ]
  >
}

// declare const animation: () => Next<Settings>

// import { list } from '../keyframe-list/domain-language'
// // import { SYMBOL_LOG } from '@escapace/fluent'

// const qwe = animation()
//   .add(
//     list()
//       .name('qwe')
//       .number('qwe1', {
//         0: () => ({ value: 1 as const, easing: 'qwe' }),
//         10: { value: 30 as const }
//       })
//       .string('qwe2', {
//         0: () => ({ value: 'qwe' as const }),
//         100: { value: 'abcd' as const }
//       })
//   )
//   .add(
//     list()
//       .name('asd')
//       .boolean('asd1', { 0: { value: true } })
//   )
//   .reduce()

// const asd = qwe().qwe
