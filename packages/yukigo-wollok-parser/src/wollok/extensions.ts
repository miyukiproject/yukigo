// Exportamos List como tipo para que funcione list: List<RuntimeObject>
export type List<T> = T[];

export const hash = (str: string) => 0;
export const isEmpty = (collection: any[]) => !collection || collection.length === 0;