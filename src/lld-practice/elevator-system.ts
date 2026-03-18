export {};

enum ElevatorState {
  Idle = 'Idle',
  Up = 'Up',
  Down = 'Down'
}

enum Direction {
  Up = 'Up',
  Down = 'Down'
}

class Elevator {
  private state = ElevatorState.Idle;
  private currentFloor = 0;
  private upRequests: number[] = [];
  private downRequests: number[] = [];

  constructor(private id: number) {}

  getId(): number {
    return this.id;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  addRequest(floor: number) {
    if (floor > this.currentFloor) {
      this.upRequests.push(floor);
      this.upRequests.sort((a, b) => a - b);
    } else {
      this.downRequests.push(floor);
      this.downRequests.sort((a, b) => b - a);
    }
  }

  step() {
    if (this.state === ElevatorState.Idle) {
      if (this.upRequests.length) {
        this.state = ElevatorState.Up;
      } else if (this.downRequests.length) {
        this.state = ElevatorState.Down;
      } else {
        return;
      }
    }

    if (this.state === ElevatorState.Up) {
      this.currentFloor++;
      if (this.upRequests.includes(this.currentFloor)) {
        this.upRequests = this.upRequests.filter(f => f !== this.currentFloor);
      }
      if (this.upRequests.length === 0) {
        this.state = this.downRequests.length ? ElevatorState.Down : ElevatorState.Idle;
      }
    } else if (this.state === ElevatorState.Down) {
      this.currentFloor--;
      if (this.downRequests.includes(this.currentFloor)) {
        this.downRequests = this.downRequests.filter(f => f !== this.currentFloor);
      }
      if (this.downRequests.length === 0) {
        this.state = this.upRequests.length ? ElevatorState.Up : ElevatorState.Idle;
      }
    }
  }
}

class ElevatorManager {
  constructor(private elevators: Elevator[], private startFloor: number, private endFloor: number) {}

  requestFloor(floor: number, direction: Direction) {
    let bestElevator: Elevator | null = null;
    let minDistance = Infinity;

    for (const elevator of this.elevators) {
      const distance = Math.abs(elevator.getCurrentFloor() - floor);
      if (distance < minDistance) {
        minDistance = distance;
        bestElevator = elevator;
      }
    }

    bestElevator?.addRequest(floor);
  }

  selectFloor(elevatorId: number, floor: number) {
    const elevator = this.elevators.filter(el => el.getId() === elevatorId);
    elevator[0]!.addRequest(floor);
  }

  step() {
    for (const elevator of this.elevators) {
      elevator.step();
    }
  }
}