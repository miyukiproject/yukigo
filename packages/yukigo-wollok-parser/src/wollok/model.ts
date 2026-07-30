// src/wollok/model.ts

export interface Class {
  getNodeByFQN: <T = any>(fqn: string) => any;
  lookupMethod: (name: string, params: number) => any;
}
export const Class: any = class {};

// Declaramos la interfaz para que pueda usarse como un Tipo en firmas como Generator<Node, ...>
export interface Node {}
export const Node: any = class {};

export const Singleton: any = class {};