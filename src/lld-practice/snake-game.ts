export {};

type Position = [number, number];

enum Direction {
  Up = "U",
  Down = "D",
  Left = "L",
  Right = "R"
}

class SnakeGame {
  private rows: number;
  private cols: number;

  private snake: Position[] = [];
  private bodySet = new Set<string>();

  private food: Position[];
  private foodIndex = 0;

  private score = 0;

  constructor(rows: number, cols: number, food: Position[]) {
    this.rows = rows;
    this.cols = cols;
    this.food = food;

    this.snake.push([0, 0]);
    this.bodySet.add(this.serialize([0, 0]));
  }

  move(direction: Direction): number {
    const [headRow, headCol] = this.snake[0]!;

    const [newRow, newCol] = this.getNextHead(headRow, headCol, direction);
    const newHead: Position = [newRow, newCol];

    if (this.isWallCollision(newHead)) {
      return -1;
    }

    const isFood =
      this.foodIndex < this.food.length &&
      this.food[this.foodIndex]![0] === newRow &&
      this.food[this.foodIndex]![1] === newCol;

    if (!isFood) {
      const tail = this.snake.pop()!;
      this.bodySet.delete(this.serialize(tail));
    }

    if (this.bodySet.has(this.serialize(newHead))) {
      return -1;
    }

    this.snake.unshift(newHead);
    this.bodySet.add(this.serialize(newHead));

    if (isFood) {
      this.score++;
      this.foodIndex++;
    }

    return this.score;
  }

  private getNextHead(row: number, col: number, direction: Direction): Position {
    switch (direction) {
      case Direction.Up:
        return [row - 1, col];
      case Direction.Down:
        return [row + 1, col];
      case Direction.Left:
        return [row, col - 1];
      case Direction.Right:
        return [row, col + 1];
    }
  }

  private isWallCollision([row, col]: Position): boolean {
    return row < 0 || col < 0 || row >= this.rows || col >= this.cols;
  }

  private serialize([row, col]: Position): string {
    return `${row},${col}`;
  }
}