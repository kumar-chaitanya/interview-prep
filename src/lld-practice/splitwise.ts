export {};

class ExpenseShare {
  constructor(public userId: number, public amount: number) {}
}

class Expense {
  constructor(
    public id: number,
    public title: string,
    public groupId: number,
    public paidBy: number,
    public shares: ExpenseShare[]
  ) {}
}

class User {
  groupBalances: Map<number, Map<number, number>> = new Map();

  constructor(public id: number, public name: string) {}
}

class Group {
  users: number[] = [];
  expenses: Expense[] = [];

  constructor(public id: number, public name: string) {}
}

class SplitwiseService {
  private users: Map<number, User> = new Map();
  private groups: Map<number, Group> = new Map();
  private expenseIdCounter = 1;

  addUser(id: number, name: string) {
    this.users.set(id, new User(id, name));
  }

  private getUser(id: number): User {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  createGroup(id: number, name: string, userIds: number[]) {
    const group = new Group(id, name);
    group.users = userIds;
    this.groups.set(id, group);
  }

  private getGroup(id: number): Group {
    const group = this.groups.get(id);
    if (!group) throw new Error("Group not found");
    return group;
  }

  addExpense(
    groupId: number,
    title: string,
    amount: number,
    paidBy: number,
    shares: ExpenseShare[],
    splitType: "equal" | "exact" = "equal"
  ) {
    const group = this.getGroup(groupId);
    const payer = this.getUser(paidBy);

    if (splitType === "exact") {
      const total = shares.reduce((sum, s) => sum + s.amount, 0);
      if (total !== amount) throw new Error("Invalid exact split");
    }

    const equalShare = splitType === "equal" ? amount / shares.length : null;

    for (const share of shares) {
      if (share.userId === paidBy) continue;

      const user = this.getUser(share.userId);
      const owesAmount = splitType === "equal" ? equalShare! : share.amount;

      if (!payer.groupBalances.has(groupId)) {
        payer.groupBalances.set(groupId, new Map());
      }
      if (!user.groupBalances.has(groupId)) {
        user.groupBalances.set(groupId, new Map());
      }

      const payerMap = payer.groupBalances.get(groupId)!;
      const userMap = user.groupBalances.get(groupId)!;

      payerMap.set(user.id, (payerMap.get(user.id) || 0) + owesAmount);
      userMap.set(payer.id, (userMap.get(payer.id) || 0) - owesAmount);
    }

    const expense = new Expense(
      this.expenseIdCounter++,
      title,
      groupId,
      paidBy,
      shares
    );

    group.expenses.push(expense);
  }

  showBalances(groupId: number) {
    const group = this.getGroup(groupId);

    for (const userId of group.users) {
      const user = this.getUser(userId);
      const balances = user.groupBalances.get(groupId);

      if (!balances) continue;

      for (const [otherUserId, amount] of balances) {
        if (amount > 0) {
          const otherUser = this.getUser(otherUserId);
          console.log(`${otherUser.name} owes ${user.name} ₹${amount}`);
        }
      }
    }
  }

  settleUp(groupId: number, payerId: number, payeeId: number, amount: number) {
    const payer = this.getUser(payerId);
    const payee = this.getUser(payeeId);

    if (!payer.groupBalances.has(groupId)) {
      payer.groupBalances.set(groupId, new Map());
    }
    if (!payee.groupBalances.has(groupId)) {
      payee.groupBalances.set(groupId, new Map());
    }

    const payerMap = payer.groupBalances.get(groupId)!;
    const payeeMap = payee.groupBalances.get(groupId)!;

    payerMap.set(payeeId, (payerMap.get(payeeId) || 0) + amount);
    payeeMap.set(payerId, (payeeMap.get(payerId) || 0) - amount);
  }

  minimizeTransactions(groupId: number) {
    const group = this.getGroup(groupId);
    const net: Record<number, number> = {};

    for (const userId of group.users) {
      net[userId] = 0;
    }

    for (const userId of group.users) {
      const user = this.getUser(userId);
      const balances = user.groupBalances.get(groupId);

      if (!balances) continue;

      for (const [otherUserId, amount] of balances) {
        if (amount > 0) {
          net[userId]! += amount;
          net[otherUserId]! -= amount;
        }
      }
    }

    const debtors: { id: number; amount: number }[] = [];
    const creditors: { id: number; amount: number }[] = [];

    for (const userId of group.users) {
      if (net[userId]! < 0) {
        debtors.push({ id: userId, amount: net[userId]! });
      } else if (net[userId]! > 0) {
        creditors.push({ id: userId, amount: net[userId]! });
      }
    }

    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const d = debtors[i];
      const c = creditors[j];

      const settled = Math.min(-d!.amount, c!.amount);

      console.log(`User ${d!.id} pays User ${c!.id} ₹${settled}`);

      d!.amount += settled;
      c!.amount -= settled;

      if (d!.amount === 0) i++;
      if (c!.amount === 0) j++;
    }
  }
}