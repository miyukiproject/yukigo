// packages/yukigo-wollok-parser/src/wollok/natives/shims.d.ts

declare module '*/constants' {
  export const APPLY_METHOD: string;
  export const CLOSURE_EVALUATE_METHOD: string;
  export const CLOSURE_TO_STRING_METHOD: string;
  export const COLLECTION_MODULE: string;
  export const DATE_MODULE: string;
  export const GAME_MODULE: string;
  export const KEYWORDS: { SELF: string };
  export const TO_STRING_METHOD: string;
}

declare module '*/interpreter/runtimeModel' {
  export type Execution<T = any> = any;
  
  export interface Evaluation {
    environment: {
      getNodeByFQN: <T>(fqn: string) => any;
    };
    frameStack: any[];
    // Métodos de despacho y colecciones
    send(methodName: string, target: any, ...args: any[]): any;
    list(...args: any[]): any;
    set(...args: any[]): any;
    reify(val: any): any;
    reifyVoid(): any;
    instantiate(module: any, fields: any): any;
    
    // Agregamos los métodos que faltaban y causaban los errores actuales
    invoke(method: any, self: any, ...args: any[]): any;
    localsFor(method: any, args: any[]): any;
    exec(method: any, frame: any): any;
  }
  
  export type NativeFunction = any;
  export type Natives = Record<string, Record<string, (...args: any[]) => any>>;
  
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
  
  export type RuntimeValue = any;
  export type Frame = any;
  export const Frame: any;

  export function assertIsNotNull(value: any, message?: string, param?: string): void;
  export function assertIsNumber(value: any, message?: string, param?: string, flag?: boolean): void;
  export function assertIsString(value: any, message?: string, param?: string, flag?: boolean): void;
  export function assertIsCollection(value: any): void;
}

declare module '*/helpers' {
  export function assertNotVoid(value: any, msg: string): void;
  export function showParameter(value: any): string;
}

declare module '*/extensions' {
  export type List<T> = T[];
  export function hash(str: string): number;
  export function isEmpty(collection: any[]): boolean;
}

declare module '*/model' {
  export interface Class {
    // Declaramos de forma explícita el método genérico que busca la stdlib
    getNodeByFQN: <T>(fqn: string) => any;
    lookupMethod: (name: string, params: number) => any;
  }
  export type Node = any;
  export type Singleton = any;
  export const Singleton: any;
}