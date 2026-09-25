/** Petites préférences locales. localStorage peut être indisponible (navigation privée…) : on ignore. */
const PREFIX = 'little-miner:';

function read(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    /* pas de persistance, tant pis */
  }
}

export const storage = {
  get bestScore(): number {
    return Number(read('best')) || 0;
  },
  set bestScore(value: number) {
    write('best', String(value));
  },
  get muted(): boolean {
    return read('muted') === '1';
  },
  set muted(value: boolean) {
    write('muted', value ? '1' : '0');
  },
  get gems(): number {
    return Number(read('gems')) || 0;
  },
  set gems(value: number) {
    write('gems', String(value));
  },
  get unlocked(): string[] {
    try {
      const list: unknown = JSON.parse(read('unlocked') ?? '[]');
      return Array.isArray(list) ? list.filter((id) => typeof id === 'string') : [];
    } catch {
      return [];
    }
  },
  set unlocked(ids: string[]) {
    write('unlocked', JSON.stringify(ids));
  },
};
