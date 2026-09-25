import * as Phaser from 'phaser';
import { storage } from '../storage';

type Sfx = 'hit' | 'break' | 'boom' | 'bonus' | 'bump';

const SFX: Record<Sfx, { key: string; volume: number; detune?: number }> = {
  hit: { key: 'HitStone', volume: 0.25 },
  break: { key: 'BreakStone', volume: 0.3 },
  boom: { key: 'BigExplosion', volume: 0.45 },
  bonus: { key: 'BreakStone', volume: 0.35, detune: 700 },
  bump: { key: 'HitStone', volume: 0.2, detune: -900 },
};

/** Joue un bruitage, légèrement désaccordé à chaque fois pour éviter l'effet « mitraillette ». */
export function playSfx(scene: Phaser.Scene, sfx: Sfx, volumeScale = 1): void {
  const { key, volume, detune = 0 } = SFX[sfx];
  scene.sound.play(key, {
    volume: volume * volumeScale,
    detune: detune + Phaser.Math.Between(-150, 150),
  });
}

export function startMusic(scene: Phaser.Scene): void {
  scene.sound.mute = storage.muted;
  if (scene.sound.get('fairytail')?.isPlaying) return;
  scene.sound.play('fairytail', { loop: true, volume: 0.18 });
}

export function toggleMute(scene: Phaser.Scene): boolean {
  const muted = !scene.sound.mute;
  scene.sound.mute = muted;
  storage.muted = muted;
  return muted;
}
