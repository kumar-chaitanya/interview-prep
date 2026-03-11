class DiscountService {
  calculateDiscount(type: string, amount: number): number {
    if (type === 'regular') {
      return amount * 0.05;
    }
    if (type === 'premium') {
      return amount * 0.10;
    }
    if (type === 'vip') {
      return amount * 0.20;
    }
    return 0;
  }
}