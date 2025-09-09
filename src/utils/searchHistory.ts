const LS_KEY = 'aladin_search_history';
const MAX_SIZE = 10;

function read(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as string[]) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  } catch {
    // 
  }
}

export function list(): string[] {
  return read();
}

export function push(keyword: string) {
  const k = (keyword ?? '').trim();
  if (!k) return;

  const cur = read();
  const deduped = [k, ...cur.filter((x) => x !== k)];
  if (deduped.length > MAX_SIZE) deduped.length = MAX_SIZE;
  write(deduped);
}

export function clear() {
  write([]);
}

export const searchHistory = { list, push, clear };
export default searchHistory;