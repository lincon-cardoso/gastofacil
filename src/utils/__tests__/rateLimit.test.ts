import { logRateLimitExceeded } from "../rateLimit";
import { prometheusClient } from "../prometheus";

describe("Rate Limiting", () => {
  it("should log and increment abuse counter when rate limit is exceeded", () => {
    const key = "test-key";

    // Mock logger
    const loggerSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    // Mock Prometheus counter
    const counterMock = { inc: jest.fn() };
    jest.spyOn(prometheusClient, "Counter").mockImplementation(() => {
      console.log("Mocking Counter instantiation"); // Debug log
      return new (class {
        inc = counterMock.inc;
      })();
    });

    logRateLimitExceeded(key);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.objectContaining({ key }),
      "Rate limit exceeded"
    );
    expect(counterMock.inc).toHaveBeenCalledWith({ key });

    loggerSpy.mockRestore();
  });
});
