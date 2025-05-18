import { expect, test } from "vitest";

/**
 * Remove indent from string. indent count from 1st or 2nd line.
 * 
 * @param input 
 * @returns 
 */
export function trimIndent(input: string) {
  let lines = input.split("\n");
  let ws = 0;
  if (lines[0].length === 0) {
    ws = countIndent(lines[1] ?? "");
  } else {
    ws = countIndent(lines[0]);
  }
  const regex = new RegExp(`^\\s{0,${ws}}`);
  lines = lines.map(line => line.replace(regex, ""));
  if (lines[0].length === 0)
    lines = lines.slice(1);
  if (lines[lines.length-1].length === 0)
    lines = lines.slice(0, lines.length - 1);
  return lines.join("\n");

  function countIndent(input: string) {
    return input.search(/\S|$/);
  }
}

test("trimIndent", () => {
  const input = `
    123
    456
    789
    `;
  const output = trimIndent(input);
  expect(output).toBe("123\n456\n789");
});