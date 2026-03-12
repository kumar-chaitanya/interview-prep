/*
Design a Pizza Ordering System using the Decorator Pattern.

Requirements:
- There are base pizzas: Margherita, Farmhouse, VegDelight.
- Each pizza has:
    description(): string
    cost(): number

- Customers can add toppings dynamically:
    ExtraCheese
    Mushrooms
    Olives
    Jalapenos
    Paneer

- Each topping increases the cost and updates the description.

Constraints:
- Toppings should be combinable at runtime.
- Avoid creating subclasses for every topping combination.
- The client should interact with a common Pizza type.

Example usage:

let pizza: Pizza = new MargheritaPizza();
pizza = new ExtraCheese(pizza);
pizza = new Olives(pizza);

console.log(pizza.description());
console.log(pizza.cost());
*/

interface Pizza {
  description(): string;
  cost(): number;
}

class Margherita implements Pizza {
  private static readonly COST = 100;

  description(): string {
    return 'Margherita';
  }

  cost(): number {
    return Margherita.COST;
  }
}

class Farmhouse implements Pizza {
  private static readonly COST = 120;

  description(): string {
    return 'Farmhouse';
  }

  cost(): number {
    return Farmhouse.COST;
  }
}

class VegDelight implements Pizza {
  private static readonly COST = 130;

  description(): string {
    return 'VegDelight';
  }

  cost(): number {
    return VegDelight.COST;
  }
}

abstract class ToppingsDecorator implements Pizza {
  constructor(protected basePizza: Pizza) {}

  description(): string {
    return this.basePizza.description();
  }

  cost(): number {
    return this.basePizza.cost();
  }
}

class ExtraCheese extends ToppingsDecorator {
  private static readonly COST = 10;

  override description(): string {
    return `${super.description()} + ExtraCheese`;
  }

  override cost(): number {
    return super.cost() + ExtraCheese.COST;
  }
}

class Mushrooms extends ToppingsDecorator {
  private static readonly COST = 5;

  override description(): string {
    return `${super.description()} + Mushrooms`;
  }

  override cost(): number {
    return super.cost() + Mushrooms.COST;
  }
}

class Olives extends ToppingsDecorator {
  private static readonly COST = 8;

  override description(): string {
    return `${super.description()} + Olives`;
  }

  override cost(): number {
    return super.cost() + Olives.COST;
  }
}

class Jalapenos extends ToppingsDecorator {
  private static readonly COST = 7;

  override description(): string {
    return `${super.description()} + Jalapenos`;
  }

  override cost(): number {
    return super.cost() + Jalapenos.COST;
  }
}

class Paneer extends ToppingsDecorator {
  private static readonly COST = 10;

  override description(): string {
    return `${super.description()} + Paneer`;
  }

  override cost(): number {
    return super.cost() + Paneer.COST;
  }
}

let pizza: Pizza = new Margherita();
pizza = new ExtraCheese(pizza);
pizza = new Olives(pizza);
pizza = new Jalapenos(pizza);
pizza = new Paneer(pizza);

console.log(pizza.description());
console.log(pizza.cost());