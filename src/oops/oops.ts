/**
 * =====================================================
 * ENUMS
 * =====================================================
 * Used to restrict account types to predefined values.
 */
enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
}

/**
 * =====================================================
 * INTERFACE
 * =====================================================
 * Defines contract for banking operations.
 */
interface BankOperations {
  deposit(amount: number): void;
  withdraw(amount: number): void;
}

/**
 * =====================================================
 * GENERIC REPOSITORY (Generics)
 * =====================================================
 * Demonstrates use of generics in TypeScript.
 */
class Repository<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return [...this.items];
  }
}

/**
 * =====================================================
 * ABSTRACT BASE CLASS (Abstraction + Encapsulation)
 * =====================================================
 */
abstract class Account implements BankOperations {
  // Static property (shared across all accounts)
  private static totalAccounts = 0;

  // Public property
  public username: string;

  // Private property
  private readonly accountNumber: string;

  // True private field (ES private)
  readonly #customerId: string;

  // Protected field (accessible in subclasses)
  protected _accountBalance: number;

  // Readonly public property
  public readonly dob: string;

  public readonly accountType: AccountType;

  constructor(
    username: string,
    accountNumber: string,
    dob: string,
    accountType: AccountType,
    balance = 0
  ) {
    if (balance < 0) throw new Error('Initial balance cannot be negative');

    this.username = username;
    this.accountNumber = accountNumber;
    this.dob = dob;
    this._accountBalance = balance;
    this.accountType = accountType;

    this.#customerId =
      username.substring(0, 3) +
      accountNumber.substring(0, 3) +
      Date.now().toString().slice(-4);

    Account.totalAccounts++;

    console.log(`New ${accountType} account created for ${username}`);
  }

  /**
   * Static method
   */
  static getTotalAccounts(): number {
    return Account.totalAccounts;
  }

  /**
   * Getter
   */
  get accountBalance(): number {
    return this._accountBalance;
  }

  /**
   * Setter with validation
   */
  protected set accountBalance(balance: number) {
    if (balance < 0) throw new Error('Balance cannot be negative');
    this._accountBalance = balance;
  }

  /**
   * Public method
   */
  getMaskedAccountNumber(): string {
    const len = this.accountNumber.length;
    return '********'.concat(this.accountNumber.slice(len - 4));
  }

  getCustomerId(): string {
    return this.#customerId;
  }

  /**
   * Concrete methods (from interface)
   */
  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Deposit must be positive');
    this.accountBalance = this.accountBalance + amount;
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('Withdrawal must be positive');
    if (amount > this.accountBalance)
      throw new Error('Insufficient balance');

    this.accountBalance = this.accountBalance - amount;
  }

  /**
   * Abstract method (must be implemented by subclasses)
   */
  abstract calculateInterest(): number;
}

/**
 * =====================================================
 * SAVINGS ACCOUNT (Inheritance + Method Overriding)
 * =====================================================
 */
class SavingsAccount extends Account {
  private static interestRate = 0.04;

  constructor(
    username: string,
    accountNumber: string,
    dob: string,
    balance = 0
  ) {
    super(username, accountNumber, dob, AccountType.SAVINGS, balance);
  }

  override calculateInterest(): number {
    return this.accountBalance * SavingsAccount.interestRate;
  }
}

/**
 * =====================================================
 * CURRENT ACCOUNT (Inheritance)
 * =====================================================
 */
class CurrentAccount extends Account {
  private overdraftLimit = 500;

  constructor(
    username: string,
    accountNumber: string,
    dob: string,
    balance = 0
  ) {
    super(username, accountNumber, dob, AccountType.CURRENT, balance);
  }

  override withdraw(amount: number): void {
    if (amount > this.accountBalance + this.overdraftLimit) {
      throw new Error('Overdraft limit exceeded');
    }
    this.accountBalance = this.accountBalance - amount;
  }

  override calculateInterest(): number {
    return 0; // Current accounts don't earn interest
  }
}

/**
 * =====================================================
 * COMPOSITION EXAMPLE
 * =====================================================
 */
class TransactionService {
  constructor(private account: Account) {}

  performDeposit(amount: number): void {
    this.account.deposit(amount);
  }

  performWithdrawal(amount: number): void {
    this.account.withdraw(amount);
  }
}

/**
 * =====================================================
 * POLYMORPHISM DEMONSTRATION
 * =====================================================
 */
function printInterest(account: Account): void {
  console.log(
    `Interest for ${account.username}: $${account.calculateInterest()}`
  );
}

/**
 * =====================================================
 * EXECUTION
 * =====================================================
 */

const savings = new SavingsAccount(
  'john_doe',
  'ABC123XYZ789',
  '1998-09-23',
  1000
);

const current = new CurrentAccount(
  'jane_doe',
  'XYZ987ABC654',
  '1995-04-11',
  500
);

const repo = new Repository<Account>();
repo.add(savings);
repo.add(current);

const transactionService = new TransactionService(savings);
transactionService.performDeposit(200);

console.log('Balance:', savings.accountBalance);

printInterest(savings);
printInterest(current);

console.log('Total Accounts:', Account.getTotalAccounts());