export {};

enum VehicleType {
  Sedan = "Sedan",
  SUV = "SUV",
  Hatchback = "Hatchback"
}

enum ReservationStatus {
  RESERVED = "RESERVED",
  CANCELLED = "CANCELLED"
}

type DateRange = {
  start: number;
  end: number;
};

class Vehicle {
  constructor(
    public readonly id: number,
    public readonly type: VehicleType,
    public readonly pricePerDay: number
  ) {}
}

class Reservation {
  constructor(
    public readonly id: number,
    public readonly vehicleId: number,
    public readonly userId: number,
    public readonly start: number,
    public readonly end: number,
    public status: ReservationStatus = ReservationStatus.RESERVED
  ) {}
}

class Store {
  public vehicles: Vehicle[] = [];

  constructor(
    public readonly id: number,
    public readonly city: string
  ) {}

  addVehicle(vehicle: Vehicle) {
    this.vehicles.push(vehicle);
  }
}

class RentalSystem {
  private stores: Store[] = [];
  private reservations = new Map<number, Reservation[]>(); // vehicleId → reservations

  addStore(store: Store) {
    this.stores.push(store);
  }

  search(city: string, start: number, end: number, type: VehicleType): Vehicle[] {
    const result: Vehicle[] = [];

    const storesInCity = this.stores.filter(s => s.city === city);

    for (const store of storesInCity) {
      for (const vehicle of store.vehicles) {

        if (vehicle.type !== type) continue;

        if (this.isVehicleAvailable(vehicle.id, start, end)) {
          result.push(vehicle);
        }
      }
    }

    return result;
  }

  book(vehicleId: number, userId: number, start: number, end: number): Reservation {
    if (!this.isVehicleAvailable(vehicleId, start, end)) {
      throw new Error("Vehicle not available");
    }

    const reservation = new Reservation(
      Date.now(),
      vehicleId,
      userId,
      start,
      end
    );

    if (!this.reservations.has(vehicleId)) {
      this.reservations.set(vehicleId, []);
    }

    this.reservations.get(vehicleId)!.push(reservation);

    return reservation;
  }

  cancel(reservationId: number) {
    for (const [, list] of this.reservations) {
      for (const res of list) {
        if (res.id === reservationId) {
          res.status = ReservationStatus.CANCELLED;
          return;
        }
      }
    }
    throw new Error("Reservation not found");
  }

  private isVehicleAvailable(vehicleId: number, start: number, end: number): boolean {
    const reservations = this.reservations.get(vehicleId) || [];

    for (const res of reservations) {
      if (res.status === ReservationStatus.CANCELLED) continue;

      if (!(end < res.start || start > res.end)) {
        return false;
      }
    }

    return true;
  }
}