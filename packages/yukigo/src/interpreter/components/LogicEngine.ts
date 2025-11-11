import { Bindings } from "../index.js";

interface LogicResultSuccess {
  success: true;
  bindings: Bindings;
}
interface LogicResultFailure {
  success: false;
}
interface LogicResultStream {
  success: true;
  bindingsStream: AsyncGenerator<Bindings>;
}

type LogicResult =
  | LogicResultSuccess
  | LogicResultFailure
  | LogicResultStream;

interface LogicSearch {
  next(): IteratorResult<Bindings>;
  all(): Bindings[];
  first(): Bindings | null;
}