export {}

import * as crypto from "crypto";

enum VehicleType {
  Bike = "Bike",
  Car = "Car",
  Truck = "Truck"
}

type Vehicle = {
  licensePlate: string;
  type: VehicleType;
};

abstract class ParkingSpot {

  protected vehicle: Vehicle | null = null;

  constructor(
    public readonly id: number,
    public readonly floorId: number,
    public readonly type: VehicleType
  ) {}

  isFree(): boolean {
    return this.vehicle === null;
  }

  parkVehicle(vehicle: Vehicle) {
    this.vehicle = vehicle;
  }

  removeVehicle() {
    this.vehicle = null;
  }

  abstract canPark(vehicle: Vehicle): boolean;
}

class BikeSpot extends ParkingSpot {
  constructor(id: number, floorId: number) {
    super(id, floorId, VehicleType.Bike);
  }

  canPark(vehicle: Vehicle): boolean {
    return vehicle.type === VehicleType.Bike;
  }
}

class CarSpot extends ParkingSpot {
  constructor(id: number, floorId: number) {
    super(id, floorId, VehicleType.Car);
  }

  canPark(vehicle: Vehicle): boolean {
    return vehicle.type === VehicleType.Car || vehicle.type === VehicleType.Bike;
  }
}

class TruckSpot extends ParkingSpot {
  constructor(id: number, floorId: number) {
    super(id, floorId, VehicleType.Truck);
  }

  canPark(vehicle: Vehicle): boolean {
    return vehicle.type === VehicleType.Truck;
  }
}

class ParkingFloor {

  public spots: ParkingSpot[] = [];

  constructor(public readonly id: number) {}

  addSpot(spot: ParkingSpot) {
    this.spots.push(spot);
  }
}

/*
  Generic storage of available spots
*/
class SpotIndex {

  private spots = new Map<VehicleType, Set<ParkingSpot>>();

  addSpot(spot: ParkingSpot) {

    if (!this.spots.has(spot.type)) {
      this.spots.set(spot.type, new Set());
    }

    this.spots.get(spot.type)!.add(spot);
  }

  removeSpot(spot: ParkingSpot) {
    this.spots.get(spot.type)?.delete(spot);
  }

  getSpots(type: VehicleType): Set<ParkingSpot> {
    return this.spots.get(type) ?? new Set();
  }
}

class EntranceGate {

  constructor(
    public readonly id: number,
    public readonly floorId: number
  ) {}
}

/*
  Simple binary heap priority queue
*/
class PriorityQueue<T> {

  private heap: { value: T; priority: number }[] = [];

  push(value: T, priority: number) {
    this.heap.push({ value, priority });
    this.heap.sort((a, b) => a.priority - b.priority);
  }

  pop(): T | null {
    if (this.heap.length === 0) return null;
    return this.heap.shift()!.value;
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

interface ParkingStrategy {

  findSpot(
    vehicle: Vehicle,
    entrance: EntranceGate,
    index: SpotIndex
  ): ParkingSpot | null;
}

/*
  Optimized nearest spot lookup
*/
class NearestSpotStrategy implements ParkingStrategy {

  findSpot(
    vehicle: Vehicle,
    entrance: EntranceGate,
    index: SpotIndex
  ): ParkingSpot | null {

    const types =
      vehicle.type === VehicleType.Bike
        ? [VehicleType.Bike, VehicleType.Car]
        : [vehicle.type];

    const pq = new PriorityQueue<ParkingSpot>();

    for (const type of types) {

      const spots = index.getSpots(type);

      for (const spot of spots) {

        const distance =
          Math.abs(spot.floorId - entrance.floorId) * 1000 + spot.id;

        pq.push(spot, distance);
      }
    }

    const bestSpot = pq.pop();

    if (bestSpot) {
      index.removeSpot(bestSpot);
    }

    return bestSpot;
  }
}

class Ticket {

  constructor(
    public readonly id: string,
    public readonly vehicle: Vehicle,
    public readonly spot: ParkingSpot,
    public readonly entryTime: number,
    public readonly entranceId: number
  ) {}
}

class TicketRepository {

  private tickets = new Map<string, Ticket>();

  add(ticket: Ticket) {
    this.tickets.set(ticket.id, ticket);
  }

  get(ticketId: string) {
    return this.tickets.get(ticketId);
  }

  remove(ticketId: string) {
    this.tickets.delete(ticketId);
  }
}

interface PaymentStrategy {
  calculate(ticket: Ticket): number;
}

class HourlyPaymentStrategy implements PaymentStrategy {

  constructor(private readonly rate: number) {}

  calculate(ticket: Ticket): number {

    const duration = Date.now() - ticket.entryTime;

    const hours = Math.ceil(duration / 3600000);

    return hours * this.rate;
  }
}

class ParkingManager {

  constructor(
    private index: SpotIndex,
    private parkingStrategy: ParkingStrategy,
    private payment: PaymentStrategy,
    private tickets: TicketRepository
  ) {}

  parkVehicle(vehicle: Vehicle, gate: EntranceGate) {

    const spot = this.parkingStrategy.findSpot(
      vehicle,
      gate,
      this.index
    );

    if (!spot) {
      throw new Error("Parking full");
    }

    spot.parkVehicle(vehicle);

    const ticket = new Ticket(
      crypto.randomUUID(),
      vehicle,
      spot,
      Date.now(),
      gate.id
    );

    this.tickets.add(ticket);

    return ticket;
  }

  unparkVehicle(ticketId: string) {

    const ticket = this.tickets.get(ticketId);

    if (!ticket) {
      throw new Error("Invalid ticket");
    }

    const payment = this.payment.calculate(ticket);

    ticket.spot.removeVehicle();

    this.index.addSpot(ticket.spot);

    this.tickets.remove(ticketId);

    return payment;
  }
}

class ExitGate {

  constructor(private manager: ParkingManager) {}

  exit(ticketId: string) {
    return this.manager.unparkVehicle(ticketId);
  }
}

class ParkingLot {

  private floors: ParkingFloor[] = [];
  private entrances: EntranceGate[] = [];
  private exits: ExitGate[] = [];

  private manager: ParkingManager;
  private index = new SpotIndex();

  constructor() {

    const ticketRepo = new TicketRepository();

    this.manager = new ParkingManager(
      this.index,
      new NearestSpotStrategy(),
      new HourlyPaymentStrategy(20),
      ticketRepo
    );

    const gate1 = new EntranceGate(1, 1);
    const gate2 = new EntranceGate(2, 2);

    this.entrances.push(gate1, gate2);

    this.exits.push(new ExitGate(this.manager));

    this.initializeFloors();
  }

  private initializeFloors() {

    for (let f = 1; f <= 3; f++) {

      const floor = new ParkingFloor(f);

      for (let i = 0; i < 10; i++) {

        const spot = new CarSpot(i, f);

        floor.addSpot(spot);

        this.index.addSpot(spot);
      }

      this.floors.push(floor);
    }
  }

  getEntrance(index: number) {
    return this.entrances[index];
  }

  getExit(index: number) {
    return this.exits[index];
  }

  getManager() {
    return this.manager;
  }
}

const parkingLot = new ParkingLot();

const entrance = parkingLot.getEntrance(0)!;

const manager = parkingLot.getManager();

const ticket = manager.parkVehicle(
  { licensePlate: "KA-01-1234", type: VehicleType.Car },
  entrance
);

console.log("Ticket:", ticket.id);

const exit = parkingLot.getExit(0)!;

const payment = exit.exit(ticket.id);

console.log("Payment:", payment);