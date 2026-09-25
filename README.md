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

Les explosions déclenchent les autres explosifs qu'elles touchent. On ne frappe que les blocs
**accessibles** (collés à un trou) : un bloc éclairé par une explosion ou une Lampe se voit,
mais il faut creuser jusqu'à lui.

### Mine sans fond et cartes

La mine traverse 4 couches de plus en plus riches (et de plus en plus barrées de bedrock) :
Terre, Roche (15 m), Caverne (40 m), Magma (80 m).

À chaque palier, le jeu se fige et propose **1 carte parmi 3**. Les paliers s'espacent au fil
de la partie (10, 25, 45, 70, 100 m…) ; la barre bleue sous le tableau de bord montre la
progression vers le prochain. Au choix : pioche plus forte, TNT plus
puissante, coups en plus, défilement ralenti… Certaines cartes sont des **malédictions** :
un gros avantage contre un inconvénient.

Chaque carte monte jusqu'à 3 niveaux, et on ne peut en porter que 6 : une fois les
emplacements pleins, seules les cartes déjà prises peuvent monter. Sous les cartes :
**Relancer** (nouveau tirage), **Passer** (+3 coups), **Bannir** (retire une carte pour la partie).

**Évolutions** (à la Vampire Survivors) : une carte au niveau max + sa partenaire → une
super-carte proposée à coup sûr, qui remplace la première.

| Évolution | Recette |
| --- | --- |
| Tapis de bombes : chaque TNT déclenche une réplique 3 lignes plus bas | Mèche longue ★3 + Artificier |
| Foreuse : casser un bloc abîme celui du dessous | Pioche de fer ★3 + Géologue |
| Œil du mineur : casser éclaire 2 cases tout autour | Lanterne + Détecteur |
| Filon-mère : casser un minerai casse ceux du même type collés | Prospecteur ★3 + Filon |

**Blocs spéciaux** : Coffre (roulette de 1, 3 ou 5 améliorations), Sablier (écran figé 5 s),
Lampe (éclaire 6 lignes), Aimant (ramasse les minerais visibles), Poulet (+10 coups).

En fin de partie, on gagne des **gemmes** (1 par diamant + 1 tous les 20 m). À l'**Atelier**
(depuis l'accueil), elles débloquent de nouvelles cartes qui pourront sortir dans les tirages, et des jetons
de relance et de bannissement en plus.

**Score** = profondeur en mètres + charbon × 2 + fer × 3 + or × 4 + diamant × 5.
Le meilleur score, les gemmes et les cartes débloquées sont gardés dans le navigateur. Touche **M** pour couper le son.

Jouable à la souris ou au doigt.

## Développement

```bash
npm install
npm run dev        # serveur local avec rechargement à chaud
npm test           # tests des règles du jeu (Vitest)
npm run build      # vérifie les types puis construit dans dist/
```

- `src/model/` : les règles, sans Phaser (testables seules) — `perks.ts` pour les cartes,
  `layers.ts` pour les couches
- `src/scenes/` : l'affichage, qui rejoue les événements renvoyés par le modèle
- `public/assets/` : images et sons d'origine

Musique : Fairy Tail, version 8-bit.
