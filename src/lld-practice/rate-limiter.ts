class RateLimiter {
  private readonly userMap = new Map<string, number[]>();

  constructor(
    private readonly windowSize: number,
    private readonly timeWindow: number
  ) {}

  private isFull(timestamps: number[]): boolean {
    return timestamps.length >= this.windowSize;
  }

  private purge(timestamps: number[], timestamp: number): void {
    while (
      timestamps.length &&
      (timestamp - timestamps[0]!) >= this.timeWindow
    ) {
      timestamps.shift();
    }
  }

  isAllowed(userId: string, timestamp: number): boolean {
    if (!this.userMap.has(userId)) {
      this.userMap.set(userId, []);
    }

    const timestamps = this.userMap.get(userId)!;

    this.purge(timestamps, timestamp);

    if (this.isFull(timestamps)) {
      return false;
    }

    timestamps.push(timestamp);
    return true;
  }
}