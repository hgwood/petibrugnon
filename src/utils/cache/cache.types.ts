interface CacheStorage<T> {
  read: () => T | Promise<T>;
  write: (value: T) => void | Promise<void>;
  clear?: () => void | Promise<void>;
}

interface CachePolicy<T> {
  refresh: (value?: T) => T | Promise<T>;
  isStale?: (value: T) => boolean;
}
