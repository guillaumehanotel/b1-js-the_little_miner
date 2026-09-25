import { PERKS, type Perk } from './model/perks';
import { storage } from './storage';

export type TokenKind = 'reroll' | 'banish';

/** Jetons en plus achetables à l'Atelier : 3 niveaux, prix croissants. */
export const TOKEN_UPGRADES: Record<TokenKind, { name: string; costs: number[] }> = {
  reroll: { name: 'Relance', costs: [4, 8, 12] },
  banish: { name: 'Bannissement', costs: [4, 8, 12] },
};

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

  /** Jetons de départ d'une partie : 1 + les améliorations achetées. */
  tokens(kind: TokenKind): number {
    return 1 + storage.upgrade(kind);
  },

  /** Prix du prochain niveau, ou null si déjà au maximum. */
  tokenCost(kind: TokenKind): number | null {
    return TOKEN_UPGRADES[kind].costs[storage.upgrade(kind)] ?? null;
  },

  buyToken(kind: TokenKind): boolean {
    const cost = meta.tokenCost(kind);
    if (cost === null || storage.gems < cost) return false;
    storage.gems = storage.gems - cost;
    storage.setUpgrade(kind, storage.upgrade(kind) + 1);
    return true;
  },

  /** Au moins un achat possible à l'Atelier avec les gemmes actuelles. */
  canBuySomething(): boolean {
    const gems = storage.gems;
    const perk = PERKS.some((p) => p.cost > 0 && !meta.isUnlocked(p) && p.cost <= gems);
    const token = (Object.keys(TOKEN_UPGRADES) as TokenKind[]).some((k) => (meta.tokenCost(k) ?? Infinity) <= gems);
    return perk || token;
  },

  buy(perk: Perk): boolean {
    if (meta.isUnlocked(perk) || storage.gems < perk.cost) return false;
    storage.gems = storage.gems - perk.cost;
    storage.unlocked = [...storage.unlocked, perk.id];
    return true;
  },
};
