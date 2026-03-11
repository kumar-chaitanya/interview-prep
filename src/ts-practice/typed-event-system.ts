export {};

// Event map describing all supported events and their payload types
type WeatherEvents = { temperature: string; humidity: string; };

// Observer interface
// E represents the event map
// update receives the event name and its corresponding payload
interface Observer<E> { update<K extends keyof E>(event: K, data: E[K]): void; }

// Observable interface defining subscription and notification behavior
interface Observable<E> {
  add<K extends keyof E>(event: K, observer: Observer<E>): void;
  remove<K extends keyof E>(event: K, observer: Observer<E>): void;
  notify<K extends keyof E>(event: K, data: E[K]): void;
}

// Generic event emitter implementing the Observable interface
// E is a map of event names to payload types
class EventEmitter<E extends Record<string, any>> implements Observable<E> {
  // Stores observers for each event
  // Map<EventName, Set<Observers>>
  private listeners = new Map<keyof E, Set<Observer<E>>>();

  // Subscribe an observer to an event
  add<K extends keyof E>(event: K, observer: Observer<E>): void {
    let observers = this.listeners.get(event);
    if (!observers) { observers = new Set(); this.listeners.set(event, observers); }
    observers.add(observer);
  }

  // Remove an observer from an event
  remove<K extends keyof E>(event: K, observer: Observer<E>): void {
    const observers = this.listeners.get(event);
    if (!observers) return;
    observers.delete(observer);
  }

  // Notify all observers subscribed to a specific event
  notify<K extends keyof E>(event: K, data: E[K]): void {
    const observers = this.listeners.get(event);
    if (!observers) return;
    for (const observer of observers) { observer.update(event, data); }
  }
}

// Concrete observer: TV display
// Reacts to weather updates
class TV implements Observer<WeatherEvents> {
  update<K extends keyof WeatherEvents>(event: K, data: WeatherEvents[K]): void {
    if (event === 'temperature') { console.log('TV → Temperature:', data); }
    if (event === 'humidity') { console.log('TV → Humidity:', data); }
  }
}

// Concrete observer: Phone application
// Simply logs all weather notifications
class Phone implements Observer<WeatherEvents> {
  update<K extends keyof WeatherEvents>(event: K, data: WeatherEvents[K]): void {
    console.log('Phone notification →', event, data);
  }
}

// Create the observable weather station
const weatherStation = new EventEmitter<WeatherEvents>();

// Create observers
const tv = new TV();
const phone = new Phone();

// Subscribe observers to events
weatherStation.add('temperature', tv);
weatherStation.add('humidity', tv);
weatherStation.add('temperature', phone);

// Trigger events
weatherStation.notify('temperature', '25 °C');
weatherStation.notify('humidity', '89%');