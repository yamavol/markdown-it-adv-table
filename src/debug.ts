export function createDebug(namespace: string) {
  const nsList = process.env.DEBUG?.split(",").map((s) => s.trim()) ?? [];

  const isEnabled = nsList.some((ns) => {
    if (ns === "*") {
      return true;
    }
    if (ns.endsWith("*")) {
      return namespace.startsWith(ns.slice(0, -1));
    }
    return ns === namespace;
  });
  
  return function debug(...args: any[]) {
    if (isEnabled) {
      const fmtArgs = args.map(arg => ` ${arg}`).join("");
      process.stderr.write(`  ${namespace}${fmtArgs} \n`);
    }
  };
}

export const debug = createDebug("adv-table:d");
export default debug;



