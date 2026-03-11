/** Incorrect Implmentation */

/**
 * Repition of logic in child classes
 * Instead we can create drive strategy and inject into vehicle
 * 
  class Vehicle {
    drive() {
      console.log('Normal Drive');
    }
  }

  class PassengerVehicle extends Vehicle {}

  class SportsVehicle extends Vehicle {
    override drive(): void {
      console.log('Enhanced Drive');
    }
  }

  class OffRoadVehicle extends Vehicle {
    override drive(): void {
      console.log('Enhanced Drive');
    }
  }

  const honda = new PassengerVehicle();
  const porshe = new SportsVehicle();
  const jeep = new OffRoadVehicle();

  honda.drive();
  porshe.drive();
  jeep.drive();
*/

/** With Strategy Pattern */

interface DriveStrategy {
  drive(): void;
}

class NormalDriveStrategy implements DriveStrategy {
  drive(): void {
    console.log('Normal Drive');
  }
}

class EnhancedDriveStrategy implements DriveStrategy {
  drive(): void {
    console.log('Enhanced Drive');
  }
}

class Vehicle {
  constructor(private readonly driveStrategy: DriveStrategy) {}

  drive(): void {
    this.driveStrategy.drive();
  }
}

class PassengerVehicle extends Vehicle {
  constructor() {
    super(new NormalDriveStrategy());
  }
}

class SportsVehicle extends Vehicle {
  constructor() {
    super(new EnhancedDriveStrategy());
  }
}

class OffRoadVehicle extends Vehicle {
  constructor() {
    super(new EnhancedDriveStrategy());
  }
}

const honda = new PassengerVehicle();
const porshe = new SportsVehicle();
const jeep = new OffRoadVehicle();

honda.drive();
porshe.drive();
jeep.drive();