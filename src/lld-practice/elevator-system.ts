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
  private requests: number[] = [];

  constructor(private id: number) {}

  move(floor: number) {}

  step() {}
}

class ElevatorManager {
  constructor(private elevators: Elevator[], private startFloor: number, private endFloor: number) {}

  requestFloor(floor: number, direction: Direction) {}

  selectFloor(elevatorId: number, floor: number) {}

  step() {}
}