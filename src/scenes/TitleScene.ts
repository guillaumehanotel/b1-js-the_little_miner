import * as Phaser from 'phaser';
import { GAME_WIDTH, GROUND_Y, VIEW_HEIGHT } from '../config';
import { startMusic, toggleMute } from '../fx/audio';
import { imageButton, pickaxeCursor, textStyle } from '../fx/effects';
import { meta } from '../meta';
import { storage } from '../storage';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    this.add.image(0, 0, 'sky').setOrigin(0);
    this.add.image(0, GROUND_Y, 'ground').setOrigin(0);
    this.add.rectangle(0, 0, GAME_WIDTH, VIEW_HEIGHT, 0x000000, 0.35).setOrigin(0);

    const logo = this.add.image(GAME_WIDTH / 2, 180, 'gametitle');
    this.tweens.add({ targets: logo, scale: 1.03, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.sprite(170, 235, 'torch').setOrigin(0).play('torch_burn');
    this.add.sprite(230, 235, 'torch').setOrigin(0).play({ key: 'torch_burn', frameRate: 11 });

    const start = () => this.scene.start('game');
    imageButton(this, GAME_WIDTH / 2, 370, 'play', start);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.keyboard?.once('keydown-ENTER', start);

    const best = storage.bestScore;
    if (best > 0) {
      this.add.text(GAME_WIDTH / 2, 440, `Record : ${best}`, textStyle(16, '#ffd84a')).setOrigin(0.5);
    }
    const workshop = this.add.container(GAME_WIDTH / 2, 490, [
      this.add.text(-24, 0, 'Atelier', textStyle(12, '#5decf5')).setOrigin(1, 0.5),
      this.add.image(-4, 0, 'diamond_block').setScale(0.3),
      this.add.text(12, 0, String(meta.gems), textStyle(12)).setOrigin(0, 0.5),
    ]);
    workshop.setSize(220, 30).setInteractive();
    workshop.on('pointerdown', () => this.scene.start('workshop'));
    this.input.keyboard?.once('keydown-A', () => this.scene.start('workshop'));
    this.add
      .text(GAME_WIDTH / 2, 550, '40 coups de pioche.\nUne carte tous les 10 m.', {
        ...textStyle(10, '#e8d5b0'),
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    const sound = this.add
      .text(GAME_WIDTH - 12, VIEW_HEIGHT - 12, this.soundLabel(), textStyle(10, '#c9a36b'))
      .setOrigin(1)
      .setInteractive();
    const mute = () => {
      toggleMute(this);
      sound.setText(this.soundLabel());
    };
    sound.on('pointerdown', mute);
    this.input.keyboard?.on('keydown-M', mute);

    // Les navigateurs bloquent le son tant qu'on n'a pas interagi : Phaser le relance au premier clic.
    startMusic(this);
    pickaxeCursor(this);
    this.cameras.main.fadeIn(400);
  }

  private soundLabel(): string {
    return this.sound.mute ? '[M] son : off' : '[M] son : on';
  }
}
