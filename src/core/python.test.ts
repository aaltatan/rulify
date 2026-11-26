// python() is checked case for case in cases.test.ts; this covers repr's quoting rules.
import { describe, expect, it } from "vitest";
import { pyRepr } from "./python.ts";

describe("pyRepr", () => {
  it("writes JSON values as Python's repr does", () => {
    expect(pyRepr("gold")).toBe("'gold'");
    expect(pyRepr("it's")).toBe(`"it's"`);
    expect(pyRepr(`say "it's"`)).toBe(`'say "it\\'s"'`);
    expect(pyRepr("a\\b\nc")).toBe("'a\\\\b\\nc'");
    expect(pyRepr("ذهبي")).toBe("'ذهبي'");
    expect(pyRepr([true, null, 0.5, { a: 1 }])).toBe("[True, None, 0.5, {'a': 1}]");
  });
});
