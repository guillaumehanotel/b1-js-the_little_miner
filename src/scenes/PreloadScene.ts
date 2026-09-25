import * as Phaser from 'phaser';
import { GAME_WIDTH, VIEW_HEIGHT } from '../config';
import { BLOCK_TYPES, type BlockKind, isSpecial } from '../model/blockTypes';
import { makeSpecialBlockTextures } from '../fx/pixelArt';
import { textStyle } from '../fx/effects';

const IMG = 'assets/img/';
const MUSIC = 'assets/music/';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload(): void {
    this.drawProgressBar();

    this.load.audio('fairytail', MUSIC + 'FairyTail.mp3');
    this.load.audio('BigExplosion', MUSIC + 'BigExplosion.mp3');
    this.load.audio('BreakStone', MUSIC + 'BreakStone.mp3');
    this.load.audio('HitStone', MUSIC + 'HitStone.mp3');

    this.load.image('gametitle', IMG + 'accueil.png');
    this.load.image('play', IMG + 'start2.png');
    this.load.image('gameover', IMG + 'gameover.png');
    this.load.image('sky', IMG + 'little_sky.png');
    this.load.image('ground', IMG + 'ground.png');
    this.load.image('pioche', IMG + 'pioche50x50.png');
    this.load.image('grass_block', IMG + 'grass_block.png');
    for (const [kind, { texture }] of Object.entries(BLOCK_TYPES) as [BlockKind, { texture: string }][]) {
      if (isSpecial(kind)) continue; // dessinés en code dans create()
      const ext = texture === 'bedrock_block' || texture === 'bonus_block' ? 'png' : 'jpg';
      this.load.image(texture, `${IMG}${texture}.${ext}`);
    }

    this.load.spritesheet('torch', IMG + 'torch.png', { frameWidth: 19, frameHeight: 39 });
    this.load.spritesheet('cracks', IMG + 'destroy_stage_all.png', { frameWidth: 60, frameHeight: 60 });
    this.load.spritesheet('tnt_boom', IMG + 'explosion.png', { frameWidth: 384, frameHeight: 384 });
    this.load.spritesheet('dynamite_boom', IMG + 'dynamite_explosion.png', {
      frameWidth: 100,
      frameHeight: 100,
      endFrame: 39,
    });
    this.load.spritesheet('pick_swing', IMG + 'pioche_animation.png', { frameWidth: 65, frameHeight: 65 });
  }

  create(): void {
    const anim = (key: string, texture: string, frameRate: number, repeat = 0) =>
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(texture), frameRate, repeat });
    anim('torch_burn', 'torch', 10, -1);
    anim('crumble', 'cracks', 40);
    anim('tnt_boom', 'tnt_boom', 24);
    anim('dynamite_boom', 'dynamite_boom', 60);
    anim('pick_swing', 'pick_swing', 18);

    // Carré blanc de 6 px pour les particules (teinté à l'usage).
    this.make.graphics({}, false).fillStyle(0xffffff).fillRect(0, 0, 6, 6).generateTexture('px', 6, 6).destroy();
    this.makeDangerGradient();
    makeSpecialBlockTextures(this);

    this.scene.start('title');
  }

  /** Dégradé rouge → transparent, affiché en haut de l'écran quand on se fait distancer. */
  private makeDangerGradient(): void {
    const texture = this.textures.createCanvas('danger', GAME_WIDTH, 120)!;
    const ctx = texture.getContext();
    const gradient = ctx.createLinearGradient(0, 0, 0, 120);
    gradient.addColorStop(0, 'rgba(220, 30, 20, 0.85)');
    gradient.addColorStop(1, 'rgba(220, 30, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, 120);
    texture.refresh();
  }

  private drawProgressBar(): void {
    const w = 260;
    const x = (GAME_WIDTH - w) / 2;
    const y = VIEW_HEIGHT / 2;
    this.add.text(GAME_WIDTH / 2, y - 30, 'Chargement…', textStyle(12, '#c9a36b')).setOrigin(0.5);
    this.add.rectangle(x, y, w, 14).setOrigin(0, 0.5).setStrokeStyle(2, 0xc9a36b);
    const fill = this.add.rectangle(x + 3, y, 0, 8, 0xffd84a).setOrigin(0, 0.5);
    this.load.on(Phaser.Loader.Events.PROGRESS, (p: number) => (fill.width = (w - 6) * p));
  }
}
