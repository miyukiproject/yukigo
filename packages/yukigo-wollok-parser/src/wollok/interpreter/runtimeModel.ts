// src/wollok/interpreter/runtimeModel.ts

// En lugar de "export type Evaluation = any;", usamos una interfaz explícita:
export interface Evaluation {
  environment: {
    getNodeByFQN: <T = any>(fqn: string) => any;
  };
  frameStack: any[];
  send(methodName: string, target: any, ...args: any[]): any;
  list(...args: any[]): any;
  set(...args: any[]): any;
  reify(val: any): any;
  reifyVoid(): any;
  instantiate(module: any, fields: any): any;
  invoke(method: any, self: any, ...args: any[]): any;
  localsFor(method: any, args: any[]): any;
  exec(method: any, frame: any): any;
}

export type Execution<T = any> = any;
export type NativeFunction = any;
export type Natives = Record<string, Record<string, (...args: any[]) => any>>;
export type RuntimeValue = any;

export interface RuntimeObject {
  module: any;
  innerCollection: any[];
  innerNumber: number;
  innerString: string;
  innerBoolean: boolean;
  innerValue: any;
  parentContext: any;
  id: any;
  get: (key: string) => RuntimeObject;
  set: (key: string, val: any) => void;
}

export const assertIsNotNull: any = (...args: any[]) => {};
export const assertIsNumber: any = (...args: any[]) => {};
export const assertIsString: any = (...args: any[]) => {};
export const assertIsCollection: any = (...args: any[]) => {};

export class Frame {
  constructor(...args: any[]) {}
  set(...args: any[]): any {}
}