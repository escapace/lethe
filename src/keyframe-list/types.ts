import $ from '@escapace/typelevel'
import {
  Action,
  Payload,
  FluentInterface,
  Model,
  Next,
  Options
} from '@escapace/fluent'

import { SYMBOL_KEYFRAME_LIST } from '../types'

export declare const KEYFRAME_LIST_INTERFACE: unique symbol
export declare const KEYFRAME_LIST_SPECIFICATION: unique symbol
export declare const KEYFRAME_LIST_REDUCER: unique symbol

export enum TypeAction {
  Name,
  Keyframes
}

export enum TypeKeyframes {
  Boolean,
  NumberArray,
  Number,
  String
}

export interface ActionKeyframes<
  T extends TypeKeyframes = TypeKeyframes,
  U extends string = string,
  V extends KeyframesMap<T> = KeyframesMap<T>,
  I extends ((...args: any[]) => any) | undefined =
    | undefined
    | ((...args: any[]) => any)
> {
  type: TypeAction.Keyframes
  payload: {
    type: T
    name: U
    keyframes: V
    interpolation: I extends (...args: any[]) => any ? I : undefined
    // $.If<
    //   $.Is.<I>,
    //   undefined,
    //   T extends TypeKeyframes.Number
    //     ? (value1: number, value2: number, t: number) => I
    //     : T extends TypeKeyframes.NumberArray
    //     ? (value1: number[], value2: number[], t: number) => I
    //     : undefined
    // >
  }
}

export interface ActionName<T extends string = string> {
  type: TypeAction.Name
  payload: T
}

export type Actions = ActionKeyframes | ActionName

type KeyframesMap<T extends TypeKeyframes> = {
  [TypeKeyframes.NumberArray]: KeyframesNumberArray
  [TypeKeyframes.Number]: KeyframesNumber
  [TypeKeyframes.Boolean]: KeyframesBoolean
  [TypeKeyframes.String]: KeyframesString
}[T]

type KeyframeValue<T> = T | ((iteration: number) => T)

export type Easing = (t: number) => number

interface KeyframesGeneric<T extends TypeKeyframes, U> {
  [key: number]: KeyframeValue<
    T extends TypeKeyframes.Number
      ? {
          value: U
          easing?: Easing
        }
      : T extends TypeKeyframes.NumberArray
      ? {
          value: U
          easing?: Easing
        }
      : { value: U }
  >
}

export type KeyframesNumberArray = KeyframesGeneric<
  TypeKeyframes.NumberArray,
  number[]
>

export type KeyframesNumber = KeyframesGeneric<TypeKeyframes.Number, number>

export type KeyframesBoolean = KeyframesGeneric<TypeKeyframes.Boolean, boolean>

export type KeyframesString = KeyframesGeneric<TypeKeyframes.String, string>

export interface Interface<T extends Model<State, Actions>>
  extends FluentInterface<T> {
  name<U extends string>(name: U): Next<Settings, T, ActionName<U>>
  number<
    U extends string,
    V extends KeyframesNumberArray,
    I extends
      | undefined
      | ((value1: number[], value2: number[], t: number) => any) = undefined
  >(
    name: U,
    keyframes: V,
    interpolation?: I
  ): Next<Settings, T, ActionKeyframes<TypeKeyframes.NumberArray, U, V, I>>
  number<
    U extends string,
    V extends KeyframesNumber,
    I extends
      | undefined
      | ((value1: number, value2: number, t: number) => any) = undefined
  >(
    name: U,
    keyframes: V,
    interpolation?: I
  ): Next<Settings, T, ActionKeyframes<TypeKeyframes.Number, U, V, I>>

  boolean<U extends string, V extends KeyframesBoolean>(
    name: U,
    keyframes: V
  ): Next<Settings, T, ActionKeyframes<TypeKeyframes.Boolean, U, V, undefined>>

  string<U extends string, V extends KeyframesString>(
    name: U,
    keyframes: V
  ): Next<Settings, T, ActionKeyframes<TypeKeyframes.String, U, V, undefined>>
}

export interface Settings {
  [Options.Interface]: typeof KEYFRAME_LIST_INTERFACE
  [Options.Specification]: typeof KEYFRAME_LIST_SPECIFICATION
  [Options.Reducer]: typeof KEYFRAME_LIST_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

export interface State {
  type: typeof SYMBOL_KEYFRAME_LIST
  isEmpty: boolean
  name: string | undefined
}

export interface InitialState {
  type: typeof SYMBOL_KEYFRAME_LIST
  isEmpty: true
  name: undefined
}

export interface Specification<_ extends Model<State>> {
  [TypeAction.Name]: {
    [Options.Type]: typeof TypeAction.Name
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'name'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [TypeAction.Keyframes]: {
    [Options.Type]: typeof TypeAction.Keyframes
    [Options.Once]: $.False
    [Options.Dependencies]: typeof TypeAction.Name
    [Options.Keys]: 'number' | 'boolean' | 'string'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [KEYFRAME_LIST_INTERFACE]: Interface<$.Cast<A, Model<State>>>
    [KEYFRAME_LIST_SPECIFICATION]: Specification<$.Cast<A, Model<State>>>
    [KEYFRAME_LIST_REDUCER]: Reducer<$.Cast<A, Action>>
  }
}

export interface Reducer<T extends Action> {
  [TypeAction.Name]: {
    name: Payload<T, TypeAction.Name>
  }
  [TypeAction.Keyframes]: { isEmpty: false }
}

export interface KeyframeListState extends State {
  isEmpty: false
  name: string
}

export interface KeyframeList
  extends FluentInterface<Model<KeyframeListState, Actions>> {}
