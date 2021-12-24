import chai, { expect } from "chai";
import { init } from "app";

describe("MyApp", () => {
  it("should return Hello World!", async () => {
    const result = await init();
    expect(result).to.equal("Hello World!");
  });
});
