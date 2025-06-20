type ObserverKey = string;

type ObserverEntry = {
  observer: IntersectionObserver;
  targets: Set<Element>;
};

const observerMap = new Map<ObserverKey, ObserverEntry>();

export function getSharedObserver(
  key: string,
  config: IntersectionObserverInit,
  callback: IntersectionObserverCallback
): IntersectionObserver {
  if (!observerMap.has(key)) {
    observerMap.set(key, {
      observer: new IntersectionObserver(callback, config),
      targets: new Set<Element>(),
    });
  }
  return observerMap.get(key)!.observer;
}

export function observeElement(
  key: string,
  element: Element,
  config: IntersectionObserverInit,
  callback: IntersectionObserverCallback
): void {
  const existing = observerMap.get(key);

  if (existing && existing.targets.has(element)) return;

  const observer = getSharedObserver(key, config, callback);
  observer.observe(element);
  observerMap.get(key)!.targets.add(element);
}

export function unobserveElement(key: string, element: Element): void {
  const entry = observerMap.get(key);
  if (!entry) return;

  entry.observer.unobserve(element);
  entry.targets.delete(element);

  if (entry.targets.size === 0) {
    entry.observer.disconnect();
    observerMap.delete(key);
  }
}
