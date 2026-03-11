export {};

/**
 * Account Types
 */
enum AccountType {
  Savings = 'Savings',
  Current = 'Current'
}

/**
 * Abstract Base Account
 */
abstract class Account {
  private static nextAccountId = 1;
  private static totalAccounts = 0;

  protected _balance: number;

  public readonly accountNumber: string;
  public readonly createdAt: number;
  public readonly accountType: AccountType;

  public owner: string;

  constructor(owner: string, amount: number, type: AccountType) {
    if (amount < 0) {
      throw new Error('Initial account balance cannot be negative');
    }

    this.owner = owner;
    this._balance = amount;
    this.accountType = type;

    this.accountNumber = `ACC-${Account.nextAccountId++}`;
    this.createdAt = Date.now();

    Account.totalAccounts++;
  }

  /**
   * Deposit money
   */
  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    this._balance += amount;
  }

  /**
   * Withdraw money
   */
  public withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdraw amount must be greater than 0');
    }

    if (amount > this._balance) {
      throw new Error('Insufficient account balance');
    }

    this._balance -= amount;
  }

  /**
   * Balance getter
   */
  get balance(): number {
    return this._balance;
  }

  /**
   * Total accounts created
   */
  static getTotalAccounts(): number {
    return Account.totalAccounts;
  }

  /**
   * Each account type calculates interest differently
   */
  abstract calculateInterest(): number;
}

/**
 * Savings Account
 */
class SavingsAccount extends Account {
  private static readonly INTEREST_RATE = 4;

  constructor(owner: string, amount: number) {
    super(owner, amount, AccountType.Savings);
  }

  override calculateInterest(): number {
    return (this._balance * SavingsAccount.INTEREST_RATE) / 100;
  }
}

/**
 * Current Account
 */
class CurrentAccount extends Account {
  private static readonly OVERDRAFT_LIMIT = 500;

  constructor(owner: string, amount: number) {
    super(owner, amount, AccountType.Current);
  }

  override calculateInterest(): number {
    return 0;
  }

  override withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdraw amount must be greater than 0');
    }

    if (this._balance + CurrentAccount.OVERDRAFT_LIMIT < amount) {
      throw new Error('Overdraft limit exceeded');
    }

    this._balance -= amount;
  }
}

/**
 * Bank Class
 */
class Bank {
  private accounts = new Map<string, Account>();

  public addAccount(account: Account): void {
    this.accounts.set(account.accountNumber, account);
  }

  public listBalances(): void {
    for (const account of this.accounts.values()) {
      console.log(
        `${account.accountNumber} (${account.accountType}) -> Balance: ${account.balance}`
      );
    }
  }

  public getAccount(accountNumber: string): Account | undefined {
    return this.accounts.get(accountNumber);
  }
}

/**
 * Transaction Service
 */
class TransactionService {
  static transfer(fromAccount: Account, toAccount: Account, amount: number): void {
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);
  }
}

/**
 * Demo
 */
const bank = new Bank();

const johnAccount = new SavingsAccount('John Doe', 100);
const janeAccount = new CurrentAccount('Jane Doe', 50);

console.log(`Interest on John's account: ${johnAccount.calculateInterest()}`);
console.log(`Interest on Jane's account: ${janeAccount.calculateInterest()}`);

bank.addAccount(johnAccount);
bank.addAccount(janeAccount);

console.log('\nInitial Balances:');
bank.listBalances();

TransactionService.transfer(johnAccount, janeAccount, 10);

console.log('\nBalances After Transfer:');
bank.listBalances();

console.log('\nTotal Accounts Created:', Account.getTotalAccounts());