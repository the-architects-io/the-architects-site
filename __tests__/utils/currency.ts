import { toBaseUnit, fromBaseUnit } from "@/utils/currency";

describe("toBaseUnit", () => {
  it("returns the raw amount", () => {
    expect(toBaseUnit(1, 2)).toBe(100);
    expect(toBaseUnit(1, 4)).toBe(10000);
    expect(toBaseUnit(1, 6)).toBe(1000000);
    expect(toBaseUnit(1, 8)).toBe(100000000);
  });

  it("works with strings and numbers", () => {
    expect(toBaseUnit("1", 2)).toBe(100);
    expect(toBaseUnit("1", 4)).toBe(10000);
    expect(toBaseUnit("1", 6)).toBe(1000000);
    expect(toBaseUnit("1", 8)).toBe(100000000);
  });

  it("works with decimal amounts", () => {
    expect(toBaseUnit(1.5, 2)).toBe(150);
  });

  it("works with negative values", () => {
    expect(toBaseUnit(-1, 2)).toBe(-100);
  });

  it("throws an error for invalid decimals", () => {
    expect(() => toBaseUnit(1, -1)).toThrow(Error);
  });

  it("handles large numbers without losing precision", () => {
    const largeNumber = 123456789123456789;
    expect(toBaseUnit(largeNumber, 18)).toBe(largeNumber * 10 ** 18);
  });

  it("throws an error for non-numeric strings", () => {
    expect(() => toBaseUnit("invalid", 2)).toThrow(Error);
  });

  it("handles zero values correctly", () => {
    expect(toBaseUnit(0, 2)).toBe(0);
  });

  it("handles edge cases for decimal values", () => {
    expect(() => toBaseUnit(1, Number.MAX_SAFE_INTEGER)).toThrow(Error);
  });
});

describe("fromBaseUnit", () => {
  it("returns the amount with decimals", () => {
    expect(fromBaseUnit(100, 2)).toBe(1);
    expect(fromBaseUnit(10000, 4)).toBe(1);
    expect(fromBaseUnit(1000000, 6)).toBe(1);
    expect(fromBaseUnit(100000000, 8)).toBe(1);
  });

  it("works with strings and numbers", () => {
    expect(fromBaseUnit("100", 2)).toBe(1);
    expect(fromBaseUnit("10000", 4)).toBe(1);
    expect(fromBaseUnit("1000000", 6)).toBe(1);
    expect(fromBaseUnit("100000000", 8)).toBe(1);
  });

  it("rounds to two decimal places when specified", () => {
    expect(fromBaseUnit(1234, 2, true)).toBe(12.34);
    expect(fromBaseUnit(1234, 3, true)).toBe(1.23);
  });

  it("works with decimal raw amounts", () => {
    expect(fromBaseUnit(150, 2)).toBe(1.5);
  });

  it("works with negative raw amounts", () => {
    expect(fromBaseUnit(-100, 2)).toBe(-1);
  });

  it("throws an error for invalid decimals", () => {
    expect(() => fromBaseUnit(100, 2.5)).toThrow(Error);
  });

  it("does not lose precision with decimal amounts", () => {
    const largeNumber = 123456789123456789;
    expect(fromBaseUnit(largeNumber * 10 ** 18, 18)).toBe(largeNumber);
  });

  it("throws an error for non-numeric strings", () => {
    expect(() => fromBaseUnit("invalid", 2)).toThrow(Error);
  });

  it("handles zero values correctly", () => {
    expect(fromBaseUnit(0, 2)).toBe(0);
  });

  it("handles edge cases for decimal values", () => {
    expect(() => fromBaseUnit(100, Number.MIN_SAFE_INTEGER)).toThrow(Error);
  });
});
