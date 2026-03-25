class Node {
  public next: Node | null = null;
  public prev: Node | null = null;

  constructor(public readonly key: number, public value: number) {}
}

class LRUCache {
  private size = 0;
  private head: Node | null = null;
  private tail: Node | null = null;
  private readonly keys = new Map<number, Node>();

  constructor(private readonly capacity: number) {
    if (capacity <= 0) {
      throw new Error('invalid capacity');
    }
  }

  private addToHead(node: Node) {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }

    this.size++;
  }

  private removeNode(node: Node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = node.next = null;
    this.size--;
  }

  private removeTail(): Node | null {
    if (!this.tail) return null;

    const node = this.tail;
    this.removeNode(node);
    return node;
  }

  get(key: number): number {
    const node = this.keys.get(key);
    if (!node) return -1;

    this.removeNode(node);
    this.addToHead(node);

    return node.value;
  }

  put(key: number, value: number): void {
    if (this.keys.has(key)) {
      const node = this.keys.get(key)!;
      node.value = value;

      this.removeNode(node);
      this.addToHead(node);
      return;
    }

    if (this.size === this.capacity) {
      const tail = this.removeTail();
      if (tail) {
        this.keys.delete(tail.key);
      }
    }

    const newNode = new Node(key, value);
    this.addToHead(newNode);
    this.keys.set(key, newNode);
  }
}

const lruCache = new LRUCache(2);

lruCache.put(1,1);
lruCache.put(2,2);
console.log(lruCache.get(1));
lruCache.put(3,3);
console.log(lruCache.get(2));
console.log(lruCache.get(3));