export {};

enum PlayerSymbol {
  X = "X",
  O = "O"
}

enum GameState {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  DRAW = "DRAW",
  WIN = "WIN"
}

class Player {
  constructor(
    public readonly name: string,
    public readonly symbol: PlayerSymbol
  ) {}
}

class Board {

  private readonly grid: string[][];
  private readonly rows: number[];
  private readonly cols: number[];
  private diag = 0;
  private antiDiag = 0;
  private moves = 0;

  constructor(private readonly size: number) {

    this.grid = Array.from({ length: size }, () => Array(size).fill(""));

    this.rows = new Array(size).fill(0);
    this.cols = new Array(size).fill(0);
  }

  isMoveValid(row: number, col: number): boolean {

    if (row < 0 || col < 0 || row >= this.size || col >= this.size) {
      return false;
    }

    return this.grid[row]![col] === "";
  }

  makeMove(player: Player, row: number, col: number): boolean {

    this.grid[row]![col] = player.symbol;

    const value = player.symbol === PlayerSymbol.X ? 1 : -1;

    this.rows[row]! += value;
    this.cols[col]! += value;

    if (row === col) {
      this.diag += value;
    }

    if (row + col === this.size - 1) {
      this.antiDiag += value;
    }

    this.moves++;

    return (
      Math.abs(this.rows[row]!) === this.size ||
      Math.abs(this.cols[col]!) === this.size ||
      Math.abs(this.diag) === this.size ||
      Math.abs(this.antiDiag) === this.size
    );
  }

  isDraw(): boolean {
    return this.moves === this.size * this.size;
  }

  printBoard() {
    console.log(this.grid.map(r => r.join(" | ")).join("\n"));
    console.log("\n");
  }
}

class TicTacToeGame {

  private readonly board: Board;

  private currentPlayer!: Player;

  private gameState = GameState.NOT_STARTED;

  constructor(
    size: number,
    private readonly player1: Player,
    private readonly player2: Player
  ) {
    this.board = new Board(size);
  }

  private getUserInput(): [number, number] {

    const rowInput = prompt("Enter row:");
    const colInput = prompt("Enter col:");

    return [
      parseInt(rowInput || "0", 10),
      parseInt(colInput || "0", 10)
    ];
  }

  startGame() {

    this.currentPlayer = this.player1;
    this.gameState = GameState.IN_PROGRESS;

    while (this.gameState === GameState.IN_PROGRESS) {

      console.log(`${this.currentPlayer.name}'s turn`);

      const [row, col] = this.getUserInput();

      if (!this.board.isMoveValid(row, col)) {
        console.log("Invalid move, retry");
        continue;
      }

      const win = this.board.makeMove(this.currentPlayer, row, col);

      this.board.printBoard();

      if (win) {

        console.log(`${this.currentPlayer.name} wins!`);
        this.gameState = GameState.WIN;
        break;
      }

      if (this.board.isDraw()) {

        console.log("Game Draw");
        this.gameState = GameState.DRAW;
        break;
      }

      this.currentPlayer =
        this.currentPlayer === this.player1
          ? this.player2
          : this.player1;
    }

    console.log("Game Finished");
  }
}

const p1 = new Player("Chaitanya", PlayerSymbol.X);
const p2 = new Player("Vishal", PlayerSymbol.O);

const game = new TicTacToeGame(3, p1, p2);

game.startGame();