/**
 * LOGGER SYSTEM - SOLID + FACTORY + REGISTRY PATTERN
 *
 * This file demonstrates a logging system designed using:
 *
 * 1. SOLID Principles
 * 2. Factory Pattern
 * 3. Registry Pattern (Self-registering plugins)
 *
 * The goal of the design:
 *
 * - Avoid switch / if-else in factories
 * - Allow adding new loggers without modifying existing code
 * - Make the system open for extension (OCP)
 * - Keep components loosely coupled
 *
 * -------------------------------------------------------
 * DISCUSSION SUMMARY
 * -------------------------------------------------------
 *
 * During design we explored three factory approaches:
 *
 * 1️⃣ Map<LoggerType, Logger>
 *    Stores logger instances
 *
 * 2️⃣ Map<LoggerType, () => Logger>
 *    Stores logger creator functions
 *
 * 3️⃣ Self-registering Registry Pattern
 *    Loggers register themselves automatically
 *
 * The third approach is the most extensible.
 *
 * -------------------------------------------------------
 * WHY NOT Map<Type, Logger> ?
 * -------------------------------------------------------
 *
 * Example:
 *
 *   Map<LoggerType, Logger>
 *
 * This stores ONE instance per logger type.
 *
 * Example behavior:
 *
 *   const logger1 = factory.createLogger(File)
 *   const logger2 = factory.createLogger(File)
 *
 * Both logger1 and logger2 refer to the SAME instance.
 *
 * This can cause issues when objects:
 *
 * - maintain internal state
 * - manage resources (files, sockets)
 * - require independent instances
 *
 * Therefore factories usually store CREATOR FUNCTIONS instead:
 *
 *   Map<Type, () => Logger>
 *
 * -------------------------------------------------------
 * REGISTRY PATTERN (SELF REGISTERING)
 * -------------------------------------------------------
 *
 * Instead of factory knowing all implementations:
 *
 *   Factory
 *     ├── ConsoleLogger
 *     ├── FileLogger
 *     └── DatabaseLogger
 *
 * Each implementation registers itself.
 *
 * This means:
 *
 * Adding a new logger requires ZERO factory changes.
 *
 * This pattern is widely used in:
 *
 * - plugin systems
 * - frameworks
 * - dependency containers
 * - extension architectures
 *
 */

/* ---------------------------------------------------- */
/* LOGGER INTERFACE                                     */
/* ---------------------------------------------------- */

/**
 * Logger interface defines the contract for all loggers.
 *
 * This follows:
 *
 * Interface Segregation Principle (ISP)
 *
 * The interface is intentionally small.
 */
interface Logger {
  log(message: string): void
}


/* ---------------------------------------------------- */
/* LOGGER REGISTRY (FACTORY + REGISTRY PATTERN)         */
/* ---------------------------------------------------- */

/**
 * LoggerRegistry is responsible for:
 *
 * - storing logger creators
 * - creating logger instances
 *
 * It acts as both:
 *
 * Factory + Registry
 *
 * Loggers register themselves here.
 */
class LoggerRegistry {

  /**
   * Map storing logger creator functions.
   *
   * Key: logger type
   * Value: function that creates the logger
   *
   * Example:
   *
   * 'console' → () => new ConsoleLogger()
   */
  private static registry = new Map<string, () => Logger>()

  /**
   * Register a new logger type
   */
  static register(type: string, creator: () => Logger) {
    this.registry.set(type, creator)
  }

  /**
   * Create a logger instance
   */
  static create(type: string): Logger {

    const creator = this.registry.get(type)

    if (!creator) {
      throw new Error(`Logger not found: ${type}`)
    }

    return creator()

  }

}


/* ---------------------------------------------------- */
/* LOGGER IMPLEMENTATIONS                               */
/* ---------------------------------------------------- */

/**
 * Console Logger
 *
 * Responsibility:
 * Only logs messages to console.
 *
 * SRP: Single Responsibility Principle
 */
class ConsoleLogger implements Logger {

  log(message: string): void {
    console.log(`[Console] ${message}`)
  }

}

/**
 * Self-register logger
 */
LoggerRegistry.register('console', () => new ConsoleLogger())


/**
 * File Logger
 *
 * In real systems this would write to a file.
 */
class FileLogger implements Logger {

  log(message: string): void {
    console.log(`[File] ${message}`)
  }

}

LoggerRegistry.register('file', () => new FileLogger())


/**
 * Database Logger
 *
 * In real systems this would insert logs into DB.
 */
class DatabaseLogger implements Logger {

  log(message: string): void {
    console.log(`[Database] ${message}`)
  }

}

LoggerRegistry.register('database', () => new DatabaseLogger())


/* ---------------------------------------------------- */
/* APPLICATION USING LOGGER                             */
/* ---------------------------------------------------- */

/**
 * Application depends on Logger abstraction.
 *
 * NOT concrete implementations.
 *
 * This follows:
 *
 * Dependency Inversion Principle (DIP)
 */
class Application {

  constructor(private logger: Logger) {}

  processOrder() {
    this.logger.log('Order processed')
  }

}


/* ---------------------------------------------------- */
/* APPLICATION ENTRY POINT                              */
/* ---------------------------------------------------- */

/**
 * Create logger using registry
 */
const logger = LoggerRegistry.create('file')

/**
 * Inject dependency into application
 */
const app = new Application(logger)

/**
 * Run application logic
 */
app.processOrder()


/* ---------------------------------------------------- */
/* EXTENDING THE SYSTEM (NO CODE MODIFICATION REQUIRED) */
/* ---------------------------------------------------- */

/**
 * Adding a new logger requires:
 *
 * 1. Create a class
 * 2. Register it
 *
 * Factory does not change.
 *
 * This perfectly satisfies Open Closed Principle.
 */

class SlackLogger implements Logger {

  log(message: string): void {
    console.log(`[Slack] ${message}`)
  }

}

LoggerRegistry.register('slack', () => new SlackLogger())


/**
 * Now the system supports Slack logging
 */

const slackLogger = LoggerRegistry.create('slack')

const slackApp = new Application(slackLogger)

slackApp.processOrder()


/* ---------------------------------------------------- */
/* SOLID PRINCIPLES APPLIED                             */
/* ---------------------------------------------------- */

/**
 * SRP
 * Each logger class handles only logging.
 *
 * OCP
 * New logger added without modifying existing code.
 *
 * LSP
 * All logger implementations can replace Logger.
 *
 * ISP
 * Logger interface has minimal responsibilities.
 *
 * DIP
 * Application depends on Logger abstraction.
 */


/* ---------------------------------------------------- */
/* DESIGN PATTERNS USED                                 */
/* ---------------------------------------------------- */

/**
 * Strategy Pattern
 * Different logging strategies.
 *
 * Factory Pattern
 * LoggerRegistry creates logger objects.
 *
 * Registry Pattern
 * Logger implementations self-register.
 *
 * Dependency Injection
 * Logger injected into Application.
 */