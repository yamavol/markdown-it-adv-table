interface DebugFunction {
  (...args: any[]): void
  isEnabled(): boolean
};

export function createDebug(namespace: string): DebugFunction {
  const nsList = process.env.DEBUG?.split(",").map((s) => s.trim()) ?? [];

  const isEnabled = nsList.some((ns) => {
    // if (ns === "*") {  // Intentionally disabled because this output
    //   return true;     // should not be mixed with other libraries. 
    // }
    if (ns === namespace) {
      return true;
    }
    if (ns.endsWith("*")) {
      return namespace.startsWith(ns.slice(0, -1));
    }
    return ns === namespace;
  });

  const debug: DebugFunction = (...args: any[]) => {
    if (isEnabled) {
      const fmtArgs = args.map(arg => ` ${arg}`).join("");
      process.stderr.write(`${fmtArgs}\n`);
    }
  };

  debug.isEnabled = () => isEnabled;
  
  return debug;
};

export const debug = createDebug("adv-table:d");
export default debug;



