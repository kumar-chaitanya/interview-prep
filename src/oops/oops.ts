/** Basic Class example */

// class Coffee {
//   beverage: string;
//   price: number;

//   constructor(beverage: string, price: number) {
//     this.beverage = beverage;
//     this.price = price;
//   }
// };

// const latte = new Coffee('latte', 210);
// console.log(latte.beverage, latte.price);


/** Access Modifiers */

class User {
  // Static property
  private static totalUsers = 0;

  // Class properties
  public username: string;
  private readonly accountNumber: string;
  
  // Another way to declare private property
  readonly #customerId: string;

  readonly dob: string;

  // protected properties can only be accessed by inherited classes
  protected _accountBalance: number;

  constructor(username: string, accountNumber: string, dob: string, balance = 0) {
    if (balance < 0) throw new Error('Balance cannot be negative');
    this.username = username;
    this.dob = dob;
    this.accountNumber = accountNumber;
    this._accountBalance = balance;
    this.#customerId = username.substring(0, 5).concat(accountNumber.substring(0, 5));
    User.totalUsers += 1;
    
    console.log('New user added: ', username);
  }

  // Getter and setter
  // To use getters and setters, declare private and protected properties using the _ prefix
  set accountBalance(balance: number) {
    if (balance < 0) throw new Error('Balance cannot be negative');
    this._accountBalance = balance;
  }

  get accountBalance(): number {
    return this._accountBalance;
  }

  // Class methods
  getAccountNumber(): string {
    const accountNumberLen = this.accountNumber.length;
    return '**********'.concat(this.accountNumber.substring(accountNumberLen - 4, accountNumberLen));
  }

  getCustomerId(): string {
    return this.#customerId;
  }

  static getTotalUsers(): number {
    return User.totalUsers;
  }
};

console.log('Total Active Users: ', User.getTotalUsers());

const john = new User('johndoe', 'ABC123DEF456789G0', '1998-09-23', 100);

console.log('*** User Details ***');
console.log('User: ', john.username);
console.log('DOB:', john.dob);
console.log('*** Account Details ***');
console.log('Account Number: ', john.getAccountNumber());
console.log('Customer Id: ', john.getCustomerId());
console.log('Balance: ', john.accountBalance);

console.log('Total Active Users: ', User.getTotalUsers());

console.log(`Trasaction alert: credited $5 to account ending with ${john.getAccountNumber()}`);
john.accountBalance = john.accountBalance + 5;
console.log('Updated balance: ', john.accountBalance);