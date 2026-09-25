import { PERKS, type Perk } from './model/perks';
import { storage } from './storage';

/** Progression entre les parties : gemmes à dépenser et cartes débloquées à l'Atelier. */
export const meta = {
  get gems(): number {
    return storage.gems;
  },

  addGems(amount: number): void {
    storage.gems = storage.gems + amount;
  },

  isUnlocked(perk: Perk): boolean {
    return perk.cost === 0 || storage.unlocked.includes(perk.id);
  },

  /** Les cartes qui peuvent sortir pendant une partie. */
  pool(): Perk[] {
    return PERKS.filter((p) => meta.isUnlocked(p));
  },

  buy(perk: Perk): boolean {
    if (meta.isUnlocked(perk) || storage.gems < perk.cost) return false;
    storage.gems = storage.gems - perk.cost;
    storage.unlocked = [...storage.unlocked, perk.id];
    return true;
  },
};
