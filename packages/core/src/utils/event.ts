/**
 * Event system for iprint
 */
export class EventSystem {
  private events: Record<string, Function[]> = {}
  private id = 0

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events[event]
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    }
  }

  trigger(event: string, ...args: any[]): void {
    const callbacks = this.events[event]
    if (callbacks && callbacks.length) {
      callbacks.forEach((callback) => {
        callback.apply(this, args)
      })
    }
  }

  clear(event: string): void {
    this.events[event] = []
  }

  getId(): number {
    return ++this.id
  }

  getNameWithId(name: string): string {
    return `${name}-${this.getId()}`
  }
}

export const event: EventSystem = new EventSystem()
