/**
 * Print a message at most N times in given time window
 * Use fixed window appraoch
*/
export {};

class LoggerRateLimiter {
  private readonly messageLogCount = new Map<string, { windowStart: number; count: number }>();

  constructor(
    private readonly timeWindow: number,
    private readonly logLimit: number
  ) {}

  shouldPrintMessage(timestamp: number, message: string): boolean {
    const entry = this.messageLogCount.get(message);

    if (!entry) {
      this.messageLogCount.set(message, {
        windowStart: timestamp,
        count: 1,
      });
      return true;
    }

    const { windowStart, count } = entry;

    if (timestamp - windowStart >= this.timeWindow) {
      this.messageLogCount.set(message, {
        windowStart: timestamp,
        count: 1,
      });
      return true;
    }

    if (count < this.logLimit) {
      this.messageLogCount.set(message, {
        windowStart,
        count: count + 1,
      });
      return true;
    }

    return false;
  }
}