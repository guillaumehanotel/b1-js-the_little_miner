# The Little Miner

Jeu de minage en JavaScript, créé en 2017 avec Phaser par :

- HANOTEL Guillaume
- DORET Alexandre
- GARDIN Kélian

Remis au goût du jour en 2026 (Vite + TypeScript + Phaser 4).

## Le jeu

Tu as 40 coups de pioche pour creuser le plus profond possible. Dès le premier coup, l'écran
descend tout seul : si ton dernier coup sort par le haut de l'écran, c'est perdu.

| Bloc | Coups pour le casser | Effet |
| --- | --- | --- |
| Terre, charbon | 1 | |
| Pierre, fer | 2 | |
| Or | 3 | |
| Diamant | 4 | |
| Bedrock | incassable | frapper ne coûte rien |
| Bonus | 1 | +5 coups de pioche, gratuit |
| TNT | 1 | souffle tout dans un rayon de 2 blocs |
| Dynamite | 1 | souffle toute la ligne |

Les explosions déclenchent les autres explosifs qu'elles touchent.

**Score** = profondeur en mètres + charbon × 2 + fer × 3 + or × 4 + diamant × 5.
Le meilleur score est gardé dans le navigateur. Touche **M** pour couper le son.

Jouable à la souris ou au doigt.

## Développement

```bash
npm install
npm run dev        # serveur local avec rechargement à chaud
npm test           # tests des règles du jeu (Vitest)
npm run build      # vérifie les types puis construit dans dist/
```

- `src/model/` : les règles, sans Phaser (testables seules)
- `src/scenes/` : l'affichage, qui rejoue les événements renvoyés par le modèle
- `public/assets/` : images et sons d'origine

Musique : Fairy Tail, version 8-bit.
