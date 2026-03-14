export {}

/*
Design a Parking Lot System.

Requirements:

The parking lot supports multiple vehicle types:
  Bike
  Car
  Truck

The parking lot has multiple floors.
Each floor contains multiple parking spots.

Parking spots are also of different types:
  BikeSpot
  CarSpot
  TruckSpot

Rules:
- A vehicle can only park in a compatible spot.
- Example:
    Bike → BikeSpot or CarSpot
    Car → CarSpot
    Truck → TruckSpot

The system should support the following operations:

1. parkVehicle(vehicle)
   Assign an available spot to the vehicle.

2. unparkVehicle(ticketId)
   Remove vehicle and free the parking spot.

3. getAvailableSpots(vehicleType)
   Return available spots for a vehicle type.

4. generateTicket(vehicle, spot)

Entities you may need:
  Vehicle
  ParkingSpot
  ParkingFloor
  ParkingLot
  Ticket

Example usage:

const parkingLot = new ParkingLot(...);

const car = new Car('KA-01-1234');

const ticket = parkingLot.parkVehicle(car);

parkingLot.unparkVehicle(ticket.id);

Goals:
- Object-oriented design
- Proper separation of responsibilities
- Extensible system (easy to add new vehicle types)
*/

enum VehicleType { Bike = 'Bike', Car = 'Car', Truck = 'Truck' }

type ParkingLotConfig = { FLOORS: { Bike: number; Car: number; Truck: number; }[]; };

type Vehicle = { category: VehicleType; licensePlate: string; };

abstract class ParkingSpot {
  private vehicle: Vehicle | null = null;
  constructor(private readonly id: number) {}
  getSpotId(): number { return this.id; }
  isFree(): boolean { return this.vehicle === null; }
  park(vehicle: Vehicle): number {
    if (!this.isFree()) throw new Error('Spot already occupied');
    this.vehicle = vehicle;
    return this.id;
  }
  unpark(): void { this.vehicle = null; }
}

class BikeSpot extends ParkingSpot {}
class CarSpot extends ParkingSpot {}
class TruckSpot extends ParkingSpot {}

interface ParkingSpotStrategy { getParkingSpot(parkingSpots: ParkingSpot[]): ParkingSpot | null; }

class FIFOParkingStrategy implements ParkingSpotStrategy {
  getParkingSpot(parkingSpots: ParkingSpot[]): ParkingSpot | null {
    for (const spot of parkingSpots) if (spot.isFree()) return spot;
    return null;
  }
}

abstract class ParkingSpotCreator { abstract createParkingSpot(id: number): ParkingSpot; }

class BikeSpotCreator extends ParkingSpotCreator { createParkingSpot(id: number): ParkingSpot { return new BikeSpot(id); } }
class CarSpotCreator extends ParkingSpotCreator { createParkingSpot(id: number): ParkingSpot { return new CarSpot(id); } }
class TruckSpotCreator extends ParkingSpotCreator { createParkingSpot(id: number): ParkingSpot { return new TruckSpot(id); } }

class ParkingFloor {
  constructor(private readonly parkingSpotsMap: Map<VehicleType, ParkingSpot[]>) {}

  private getCompatibleSpots(vehicle: Vehicle): ParkingSpot[] {
    if (vehicle.category === VehicleType.Bike) {
      return [...(this.parkingSpotsMap.get(VehicleType.Bike) || []), ...(this.parkingSpotsMap.get(VehicleType.Car) || [])];
    }
    if (vehicle.category === VehicleType.Car) {
      return this.parkingSpotsMap.get(VehicleType.Car) || [];
    }
    return this.parkingSpotsMap.get(VehicleType.Truck) || [];
  }

  getParkingSpot(vehicle: Vehicle, strategy: ParkingSpotStrategy): ParkingSpot | null {
    const compatibleSpots = this.getCompatibleSpots(vehicle);
    return strategy.getParkingSpot(compatibleSpots);
  }
}

class ParkingFloorFactory {
  private static spotId = 1;

  private static createParkingSpots(totalSpots: number, creator: ParkingSpotCreator): ParkingSpot[] {
    const spots: ParkingSpot[] = [];
    for (let i = 0; i < totalSpots; i++) spots.push(creator.createParkingSpot(this.spotId++));
    return spots;
  }

  static createParkingFloor(floorConfig: ParkingLotConfig['FLOORS'][0]): ParkingFloor {
    const creatorRegistry = new Map<VehicleType, ParkingSpotCreator>([
      [VehicleType.Bike, new BikeSpotCreator()],
      [VehicleType.Car, new CarSpotCreator()],
      [VehicleType.Truck, new TruckSpotCreator()]
    ]);

    const parkingSpotsMap = new Map<VehicleType, ParkingSpot[]>();

    for (const category of Object.values(VehicleType)) {
      const creator = creatorRegistry.get(category);
      if (creator) {
        const spots = this.createParkingSpots(floorConfig[category], creator);
        parkingSpotsMap.set(category, spots);
      }
    }

    return new ParkingFloor(parkingSpotsMap);
  }
}

class Ticket {
  constructor(public readonly vehicle: Vehicle, public readonly id: number, public readonly spotId: number) {}
}

class ParkingManager {
  private static ticketId = 1;
  private readonly parkingFloors: ParkingFloor[] = [];
  private readonly ticketMap = new Map<number, ParkingSpot>();
  constructor(config: ParkingLotConfig, private readonly strategy: ParkingSpotStrategy) {
    for (const floorConfig of config.FLOORS) this.parkingFloors.push(ParkingFloorFactory.createParkingFloor(floorConfig));
  }

  parkVehicle(vehicle: Vehicle): Ticket {
    for (const floor of this.parkingFloors) {
      const spot = floor.getParkingSpot(vehicle, this.strategy);
      if (spot) {
        const spotId = spot.park(vehicle);
        const ticket = new Ticket(vehicle, ParkingManager.ticketId++, spotId);
        this.ticketMap.set(ticket.id, spot);
        return ticket;
      }
    }
    throw new Error('Parking Lot Full');
  }

  unparkVehicle(ticket: Ticket): void {
    const spot = this.ticketMap.get(ticket.id);
    if (!spot) throw new Error('Invalid ticket');
    spot.unpark();
    this.ticketMap.delete(ticket.id);
  }
}

class ParkingLot {
  private readonly manager: ParkingManager;
  constructor(config: ParkingLotConfig, strategy: ParkingSpotStrategy) { this.manager = new ParkingManager(config, strategy); }
  parkVehicle(vehicle: Vehicle): Ticket { return this.manager.parkVehicle(vehicle); }
  unparkVehicle(ticket: Ticket): void { this.manager.unparkVehicle(ticket); }
}

const parkingLot = new ParkingLot({ FLOORS: [{ Bike: 10, Car: 50, Truck: 5 }] }, new FIFOParkingStrategy());

const ticket = parkingLot.parkVehicle({ category: VehicleType.Car, licensePlate: 'KA-01-1234' });

parkingLot.unparkVehicle(ticket);