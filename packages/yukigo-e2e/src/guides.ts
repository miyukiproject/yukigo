import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { YukigoPrologParser } from "yukigo-prolog-parser";
import { YukigoWollokParser, providers } from "yukigo-wollok-parser";
import { isRuntimeClass, YuString, type InterpreterConfig } from "yukigo";
import { YukigoParser } from "yukigo-ast";

export interface GuideConfig {
  parser: YukigoParser;
  studentParser: YukigoParser;
  interpreterConfig: Partial<InterpreterConfig>;
  extrasByGuide?: Record<number, string>;
  postProcessSubject?: (code: string, guideId: number) => string;
  postProcessTest?: (testCode: string, guideId: number) => string;
}

export const guideConfigs: Record<string, GuideConfig> = {
  haskell: {
    parser: new YukigoHaskellParser(),
    studentParser: new YukigoHaskellParser("", {
      typecheck: false,
      includePrims: true,
    }),
    interpreterConfig: {
      lazyLoading: true,
      mutability: false,
      debug: true,
    },
  },
  prolog: {
    parser: new YukigoPrologParser(),
    studentParser: new YukigoPrologParser(""),
    interpreterConfig: {
      lazyLoading: true,
      outputMode: "all",
      mutability: true,
      debug: true,
    },
  },
  wollok: {
    parser: new YukigoWollokParser(),
    studentParser: new YukigoWollokParser(),
    interpreterConfig: {
      nativeProviders: providers,
      hooks: [
        {
          onInterpreterError: (error, ctx) => {
            const cleanMessage = error.message || String(error);

            let targetClass = "Exception";
            if (error.context === "PatternMatch") {
              targetClass = "MessageNotUnderstoodException";
            }

            // 2. Buscamos la clase específica o caemos en la Exception base
            let classDef = ctx.lookup(targetClass);

            // 3. Instanciamos como RuntimeObject de Wollok
            if (classDef && isRuntimeClass(classDef) && classDef.instantiate) {
              const inst = classDef.instantiate(targetClass);
              inst.fields.set("message", new YuString(cleanMessage));
              return inst;
            }
            return new YuString(cleanMessage);
          },
        },
      ],
      lazyLoading: false,
      mutability: true,
      debug: false,
    },
    extrasByGuide: {
      4: `
        object caperucita {
          method vasACasaDeTuAbuelita() = true
          method cuantoPesas() = 80
          method comoEstas() = "Contenta de estar en una clase de programación"
          method deQueColorEsLoQueLlevasEnLaCanasta() = "rojo"
        }
      `,
      43: `
object buenosAires {
  method kilometro() = 0
  override method toString() = "buenosAires"
}

object santaFe {
  method kilometro() = 315
  override method toString() = "santaFe"
}

object rosario {
  method kilometro() = 514
  override method toString() = "rosario"
}

object mercedes {
  method cantar() {
    return "♪ una voz antigua de viento y de sal ♫"
  } 
  
  override method toString() = "mercedes"
}

object anastasia {
  method cantar() {
    return "priiiip priiiip"
  }
  
  method volarEnCirculos() {}
  
  method comerLombriz() {}
  
  override method toString() = "anastasia"
}

object pepita {
  var energia = 100
  var ciudad = rosario
  
  method energia(unaEnergia) { energia = unaEnergia  }
  method energia() = energia
  method ciudad() = ciudad
  
  method cantar() {
    //mumukiConsole.println("pri pri pri")
    return "pri pri pri"
  }
  
  //method saludar() {
  //  return "Hola!"
  //}
  
  method comerLombriz() {
    energia += 20
  }
  
  method comerAlpiste(gramos) {
    energia += gramos * 15
  }
  
  method volarEnCirculos() {
    energia -= 10
  }
  method estasFeliz() {
    return energia > 90
  }
  
  method volarHacia(unaCiudad) {
    energia -= self.distancia(unaCiudad) * 3
    ciudad = unaCiudad
  }
  
  method distancia(unaCiudad) = (ciudad.kilometro() - unaCiudad.kilometro()).abs()
  
  method comerAlpisteYVolarHacia(gramos, unaCiudad) {
    self.comerAlpiste(gramos)
    self.volarHacia(unaCiudad)
  }
  
  override method toString() = "pepita"
}
  `,
    },
  },
};
