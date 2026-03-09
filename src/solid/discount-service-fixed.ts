export {};

interface DiscountStrategy {
  calculate(amount: number): number;
}

class RegularDiscount implements DiscountStrategy {
  private static readonly DISCOUNT = 0.05;

  public calculate(amount: number): number {
    return amount * RegularDiscount.DISCOUNT;
  }
}

class PremiumDiscount implements DiscountStrategy {
  private static readonly DISCOUNT = 0.10;

  public calculate(amount: number): number {
    return amount * PremiumDiscount.DISCOUNT;
  }
}

class VIPDiscount implements DiscountStrategy {
  private static readonly DISCOUNT = 0.20;

  public calculate(amount: number): number {
    return amount * VIPDiscount.DISCOUNT;
  }
}

class CheckoutService {
  private _discount: DiscountStrategy;

  constructor(discount: DiscountStrategy) {
    this._discount = discount;
  }

  public checkout(amount: number): void {
    const discountAmount = this._discount.calculate(amount);

    console.log(`Original Price: ${amount}`);
    console.log(`Discount: ${discountAmount}`);
    console.log(`Final price: ${amount - discountAmount}`);
  }
}

const discount = new PremiumDiscount();
const checkout = new CheckoutService(discount);
checkout.checkout(1000);