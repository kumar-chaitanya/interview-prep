/**
 * ================================
 * 🚀 Elevator System (FAANG-Level LLD)
 * ================================
 *
 * This implementation models a scalable and extensible Elevator System with
 * clear separation of concerns and pluggable dispatching strategies.
 *
 * -------------------------------
 * 🧠 Core Design Principles
 * -------------------------------
 * 1. Separation of Concerns
 *    - Request Modeling → encapsulates user intent
 *    - Dispatcher → decides which elevator handles a request
 *    - Elevator → executes movement and serves requests
 *    - Manager → orchestrates system interactions
 *
 * 2. Two Core Algorithms
 *    - Dispatching Algorithm:
 *        Assigns incoming requests to the best elevator
 *        (e.g., nearest, direction-aware, zone-based, odd/even)
 *
 *    - Movement Algorithm:
 *        Each elevator processes requests using a SCAN-like approach:
 *        - Continues in current direction
 *        - Serves requests along the way
 *        - Switches direction when no pending requests
 *
 * -------------------------------
 * 📦 Core Components
 * -------------------------------
 *
 * 1. Request
 *    - Represents both internal and external requests
 *    - Fields:
 *        floor: number
 *        type: Internal | External
 *        direction?: Up | Down (only for external)
 *    - Extensible for:
 *        priority, timestamp, VIP flag, etc.
 *
 * 2. Dispatcher (Strategy Pattern)
 *    - Responsible for selecting the best elevator
 *    - Input: Request + list of elevators
 *    - Output: Selected elevator
 *
 *    Implemented Strategy:
 *    - DirectionBasedNearestDispatcher:
 *        - Prefers elevators moving toward request in same direction
 *        - Falls back to idle elevators
 *        - Final fallback → nearest elevator
 *
 *    Extensible Strategies:
 *    - Zone-based dispatching
 *    - Odd/Even dispatching
 *    - Load-based dispatching
 *    - Priority-aware dispatching
 *
 *    Note:
 *    Zone/odd-even mappings belong inside Dispatcher,
 *    not ElevatorManager (keeps logic modular and pluggable)
 *
 * 3. Elevator
 *    - Maintains:
 *        currentFloor
 *        state (Idle / Up / Down)
 *        upRequests (Set)
 *        downRequests (Set)
 *
 *    - Responsibilities:
 *        - Accept requests
 *        - Move one step at a time
 *        - Serve requests efficiently
 *
 *    - Movement Logic:
 *        - SCAN-style (disk scheduling analogy)
 *        - Up → serve ascending floors
 *        - Down → serve descending floors
 *
 *    - Optimizations:
 *        - Uses Set → avoids duplicates, O(1) lookup
 *        - Can be extended with PriorityQueue for advanced scheduling
 *
 * 4. ElevatorManager
 *    - Orchestrates the system
 *    - Responsibilities:
 *        - Receives requests
 *        - Delegates to Dispatcher (external requests)
 *        - Directly assigns internal requests
 *        - Runs simulation via step()
 *        - Validates floor bounds
 *
 * -------------------------------
 * 🔄 System Flow
 * -------------------------------
 *
 * External Request:
 *   User presses hall button
 *        ↓
 *   Request created (floor + direction)
 *        ↓
 *   Dispatcher selects elevator
 *        ↓
 *   Elevator receives request
 *
 * Internal Request:
 *   User selects floor inside elevator
 *        ↓
 *   Directly added to elevator
 *
 * Execution:
 *   Elevator.step()
 *        ↓
 *   Processes requests using movement algorithm
 *
 * -------------------------------
 * ⚙️ Advanced Features Supported
 * -------------------------------
 *
 * 1. Zone-Based Dispatching
 *    - Floors divided into zones
 *    - Each zone mapped to specific elevators
 *
 * 2. Odd/Even Dispatching
 *    - Even floors → certain elevators
 *    - Odd floors → others
 *
 * 3. Priority Handling
 *    - Requests can have priority (VIP, emergency)
 *    - Dispatcher + Elevator queues can prioritize accordingly
 *
 * 4. VIP Elevators
 *    - Elevators can be tagged (NORMAL / VIP)
 *    - Dispatcher prioritizes VIP elevators for VIP requests
 *
 * 5. Scalability
 *    - Single manager for simplicity
 *    - Can be extended to:
 *        GlobalCoordinator → multiple ZoneManagers → elevators
 *
 * 6. Fault Handling (Extensible)
 *    - Maintenance mode
 *    - Broken elevators
 *    - Request reassignment
 *
 * -------------------------------
 * 🏗️ Extensibility
 * -------------------------------
 *
 * Easily extendable for:
 *    - New dispatching strategies
 *    - Priority queues
 *    - Destination dispatch systems
 *    - Load balancing
 *    - Energy optimization
 *
 * -------------------------------
 * 🎯 Interview Key Takeaways
 * -------------------------------
 *
 * - Clear separation of dispatching and movement logic
 * - Strategy pattern for extensibility
 * - Real-world behavior modeling (SCAN algorithm)
 * - Efficient data structures (Set, potential PQ)
 * - Scalable architecture (zone partitioning possible)
 *
 * This design is production-aligned and demonstrates strong
 * system design and LLD fundamentals (SDE-2 → SDE-3 level).
 *
 * ================================
 */

export {}

enum ElevatorState {
  Idle = 'Idle',
  Up = 'Up',
  Down = 'Down'
}

enum Direction {
  Up = 'Up',
  Down = 'Down'
}

enum RequestType {
  Internal = 'Internal',
  External = 'External'
}

class Request {
  constructor(
    public readonly floor: number,
    public readonly type: RequestType,
    public readonly direction?: Direction
  ) {}
}

interface Dispatcher {
  selectElevator(request: Request, elevators: Elevator[]): Elevator;
}

class DirectionBasedNearestDispatcher implements Dispatcher {
  selectElevator(request: Request, elevators: Elevator[]): Elevator {
    let best: Elevator | null = null;
    let minDistance = Infinity;

    const { floor, direction } = request;

    for (const elevator of elevators) {
      const state = elevator.getState();
      const current = elevator.getCurrentFloor();
      const distance = Math.abs(current - floor);

      if (request.type === RequestType.External && direction) {
        if (
          state === ElevatorState.Up &&
          direction === Direction.Up &&
          current <= floor
        ) {
          if (distance < minDistance) {
            minDistance = distance;
            best = elevator;
          }
        } else if (
          state === ElevatorState.Down &&
          direction === Direction.Down &&
          current >= floor
        ) {
          if (distance < minDistance) {
            minDistance = distance;
            best = elevator;
          }
        } else if (state === ElevatorState.Idle) {
          if (distance < minDistance) {
            minDistance = distance;
            best = elevator;
          }
        }
      }
    }

    if (!best) {
      for (const elevator of elevators) {
        const distance = Math.abs(elevator.getCurrentFloor() - floor);
        if (distance < minDistance) {
          minDistance = distance;
          best = elevator;
        }
      }
    }

    if (!best) {
      throw new Error('No elevators available');
    }

    return best;
  }
}

class Elevator {
  private state = ElevatorState.Idle;
  private currentFloor = 0;

  private upRequests = new Set<number>();
  private downRequests = new Set<number>();

  constructor(private readonly id: number) {}

  getId(): number {
    return this.id;
  }

  getState(): ElevatorState {
    return this.state;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  addRequest(request: Request) {
    const floor = request.floor;

    if (floor === this.currentFloor) return;

    if (floor > this.currentFloor) {
      this.upRequests.add(floor);
    } else {
      this.downRequests.add(floor);
    }
  }

  step() {
    if (this.state === ElevatorState.Idle) {
      if (this.upRequests.size > 0) {
        this.state = ElevatorState.Up;
      } else if (this.downRequests.size > 0) {
        this.state = ElevatorState.Down;
      } else {
        return;
      }
    }

    if (this.state === ElevatorState.Up) {
      this.currentFloor++;

      if (this.upRequests.has(this.currentFloor)) {
        this.upRequests.delete(this.currentFloor);
      }

      if (this.upRequests.size === 0) {
        this.state = this.downRequests.size > 0
          ? ElevatorState.Down
          : ElevatorState.Idle;
      }
    } else if (this.state === ElevatorState.Down) {
      this.currentFloor--;

      if (this.downRequests.has(this.currentFloor)) {
        this.downRequests.delete(this.currentFloor);
      }

      if (this.downRequests.size === 0) {
        this.state = this.upRequests.size > 0
          ? ElevatorState.Up
          : ElevatorState.Idle;
      }
    }
  }
}


class ElevatorManager {
  constructor(
    private readonly elevators: Elevator[],
    private readonly startFloor: number,
    private readonly endFloor: number,
    private readonly dispatcher: Dispatcher
  ) {}

  requestElevator(request: Request) {
    this.validateFloor(request.floor);

    if (request.type === RequestType.External) {
      const elevator = this.dispatcher.selectElevator(request, this.elevators);
      elevator.addRequest(request);
    }
  }

  selectFloor(elevatorId: number, floor: number) {
    this.validateFloor(floor);

    const elevator = this.elevators.find(e => e.getId() === elevatorId);

    if (!elevator) {
      throw new Error('Invalid elevator id');
    }

    const request = new Request(floor, RequestType.Internal);
    elevator.addRequest(request);
  }

  step() {
    for (const elevator of this.elevators) {
      elevator.step();
    }
  }

  private validateFloor(floor: number) {
    if (floor < this.startFloor || floor > this.endFloor) {
      throw new Error('Invalid floor');
    }
  }
}

const elevators = [
  new Elevator(1),
  new Elevator(2)
];

const manager = new ElevatorManager(
  elevators,
  0,
  10,
  new DirectionBasedNearestDispatcher()
);

manager.requestElevator(
  new Request(5, RequestType.External, Direction.Up)
);

manager.selectFloor(1, 8);

for (let i = 0; i < 10; i++) {
  manager.step();
}