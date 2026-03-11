interface WeatherState {
  temperature: string;
  humidity: string;
}

interface Observer {
  update(event: string, data: string): void;
}

interface Observable {
  add(event: string, observer: Observer): void;
  remove(event: string, observer: Observer): void;
  notify(event: string, data: string): void;
}

class WeatherStation implements Observable {
  private state: WeatherState;
  private eventManager = new Map<string, Set<Observer>>();

  constructor() {
    this.state = {
      temperature: "22 °C",
      humidity: "43%"
    };
  }

  add(event: string, observer: Observer): void {
    let listeners = this.eventManager.get(event);
    if (!listeners) {
      listeners = new Set();
      this.eventManager.set(event, listeners);
    }
    listeners.add(observer);
  }

  remove(event: string, observer: Observer): void {
    const listeners = this.eventManager.get(event);
    if (!listeners) return;
    listeners.delete(observer);
  }

  notify(event: string, data: string): void {
    const listeners = this.eventManager.get(event);
    if (!listeners) return;
    for (const observer of listeners) {
      observer.update(event, data);
    }
  }

  setTemperature(temperature: string): void {
    this.state.temperature = temperature;
    this.notify("temperature", temperature);
  }

  setHumidity(humidity: string): void {
    this.state.humidity = humidity;
    this.notify("humidity", humidity);
  }
}

class TV implements Observer {
  update(event: string, data: string): void {
    if (event === 'temperature') {
      return console.log(`TV Display → Temperature: ${data}`);
    }
    if (event === 'humidity') {
      return console.log(`TV Display → Humidity: ${data}`);
    }
  }
}

class Phone implements Observer {
  update(event: string, data: string): void {
        if (event === 'temperature') {
      return console.log(`Phone App → Temperature: ${data}`);
    }
    if (event === 'humidity') {
      return console.log(`Phone App → Humidity: ${data}`);
    }
  }
}

const tv = new TV();
const phone = new Phone();

const weatherStation = new WeatherStation();

weatherStation.add("temperature", tv);
weatherStation.add('humidity', tv);
weatherStation.add("temperature", phone);

weatherStation.setTemperature("25 °C");
weatherStation.setHumidity("89%");
weatherStation.setHumidity("92%");
weatherStation.setTemperature("22 °C");