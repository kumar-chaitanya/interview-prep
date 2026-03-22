/**
 * ================================
 * 🚀 Rate Limiter (LLD Summary)
 * ================================
 *
 * This implementation covers multiple approaches to designing a Rate Limiter,
 * along with their tradeoffs, optimizations, and real-world considerations.
 *
 * -------------------------------
 * 🎯 Problem
 * -------------------------------
 * Limit number of requests per user within a time window.
 *
 * Example:
 *   Allow 3 requests per 10 seconds per user
 *
 * API:
 *   isAllowed(userId: string, timestamp: number) → boolean
 *
 * -------------------------------
 * 🧠 Core Concepts
 * -------------------------------
 *
 * 1. Sliding Window (Exact Approach)
 * ---------------------------------
 * - Store timestamps of requests per user
 * - Remove (purge) timestamps older than (currentTime - window)
 * - If remaining count >= limit → reject
 * - Else → allow and add timestamp
 *
 * Data Structures:
 *   Map<userId, Deque<number>>
 *
 * Flow:
 *   purge old timestamps (while front is expired)
 *   if size >= limit → reject
 *   else add timestamp → allow
 *
 * Complexity:
 *   O(1) amortized per request
 *
 * Important:
 *   - Works only if timestamps are increasing (queue stays sorted)
 *   - Purge condition:
 *       timestamp - oldest >= window
 *
 *
 * -------------------------------
 * ⚠️ Edge Cases / Common Pitfalls
 * -------------------------------
 *
 * 1. Always check BEFORE inserting new request
 *    (check → decide → then add)
 *
 * 2. Correct purge condition:
 *    timestamp - oldTimestamp >= window
 *
 * 3. Array.shift() is O(n)
 *    → acceptable for interview, but use deque in production
 *
 * 4. Increasing timestamps assumption:
 *    ensures queue is sorted → enables O(1) purge
 *
 *
 * -------------------------------
 * 🪣 Time Bucket Approach (Optimized Counting)
 * -------------------------------
 *
 * Idea:
 *   Instead of storing every request, store counts per time slot
 *
 * Example:
 *   bucket[t] = number of requests at time t
 *
 * Check:
 *   sum of last 'window' buckets
 *
 * Important:
 *   - Only consider last T seconds (NOT all buckets)
 *   - Do NOT add request before checking limit
 *
 * Optimization:
 *   - Use circular array of size = window
 *   - index = timestamp % window
 *   - Reset bucket if timestamp mismatch
 *
 * Limitation:
 *   - Boundary burst problem:
 *     requests near bucket edges can exceed limit
 *
 * Tradeoff:
 *   ✔ O(1) space and time
 *   ❌ Approximate (not exact like sliding window)
 * 
 * Implementation:
  class RateLimiter:

  init(windowSize, timeWindow):
      windowSize = windowSize        // max requests allowed
      timeWindow = timeWindow        // in seconds
      buckets = array of size timeWindow
      for i in 0 to timeWindow-1:
          buckets[i] = { timestamp: -1, count: 0 }

  isAllowed(timestamp):

      index = timestamp % timeWindow

      // 1. Reset bucket if stale
      if buckets[index].timestamp != timestamp:
          buckets[index].timestamp = timestamp
          buckets[index].count = 0

      // 2. Compute total requests in valid window
      total = 0
      for i in 0 to timeWindow-1:
          if buckets[i].timestamp >= (timestamp - timeWindow + 1):
              total += buckets[i].count

      // 3. Check limit BEFORE adding current request
      if total >= windowSize:
          return false

      // 4. Add current request
      buckets[index].count += 1

      return true
 *
 *
 * -------------------------------
 * 🪙 Token Bucket (Production-Grade)
 * -------------------------------
 *
 * Idea:
 *   - Maintain tokens representing capacity
 *   - Each request consumes 1 token
 *   - Tokens refill over time
 *
 * Variables:
 *   capacity (max tokens)
 *   tokens (current available)
 *   refillRate (tokens per second)
 *   lastRefillTime
 *
 * Flow:
 *   refill tokens based on elapsed time
 *   if tokens >= 1 → allow and decrement
 *   else → reject
 *
 * Properties:
 *   ✔ O(1) space
 *   ✔ Supports bursts
 *   ✔ No request storage
 * 
 * Implementation:
  class TokenBucket:

  init(capacity, refillRate):
      capacity = capacity              // max tokens
      tokens = capacity                // start full
      refillRate = refillRate          // tokens per second
      lastRefillTime = 0               // last updated timestamp

  isAllowed(timestamp):

      // 1. Refill tokens based on elapsed time
      elapsed = timestamp - lastRefillTime

      tokens = tokens + (elapsed * refillRate)

      if tokens > capacity:
          tokens = capacity

      lastRefillTime = timestamp

      // 2. Check if request can be served
      if tokens >= 1:
          tokens = tokens - 1
          return true

      return false
 *
 *
 * -------------------------------
 * 🚰 Leaky Bucket (Traffic Shaping)
 * -------------------------------
 *
 * Idea:
 *   - Requests enter a queue (bucket)
 *   - Processed at constant rate
 *   - If bucket overflows → reject
 *
 * Properties:
 *   ✔ Smooth output rate
 *   ❌ Does not allow bursts
 *
 * Implementation:
  class LeakyBucket:

  init(capacity, leakRate):
      capacity = capacity              // max queue size
      leakRate = leakRate              // requests processed per second
      currentSize = 0                  // current requests in bucket
      lastProcessedTime = 0            // last time we leaked

  isAllowed(timestamp):

      // 1. Leak (process) requests based on elapsed time
      elapsed = timestamp - lastProcessedTime

      leaked = elapsed * leakRate

      currentSize = currentSize - leaked

      if currentSize < 0:
          currentSize = 0

      lastProcessedTime = timestamp

      // 2. Check if we can accept new request
      if currentSize < capacity:
          currentSize = currentSize + 1
          return true

      return false
 *
 *
 * -------------------------------
 * ⚖️ Comparison
 * -------------------------------
 *
 * Sliding Window:
 *   ✔ Exact
 *   ❌ Stores all requests
 *
 * Time Bucket:
 *   ✔ Efficient
 *   ❌ Boundary inaccuracies
 *
 * Token Bucket:
 *   ✔ Efficient + burst-friendly
 *   ✔ No storage
 *   → Most used in real systems
 *
 * Leaky Bucket:
 *   ✔ Smooth traffic
 *   ❌ No bursts allowed
 *
 *
 * -------------------------------
 * 🎯 Interview Strategy
 * -------------------------------
 *
 * 1. Start with Sliding Window (clear + correct)
 * 2. Mention optimizations:
 *      - Time Bucket (space optimized)
 *      - Token Bucket (production-ready)
 *
 * Key Line:
 *   "Sliding window is accurate but stores all requests.
 *    Token bucket is more efficient and widely used in production."
 *
 * ================================
 */

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