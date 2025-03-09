import type { Room } from '@mikewesthad/dungeon';

export class TilemapVisibility {
  shadowLayer: Phaser.Tilemaps.TilemapLayer;
  activeRoom: Room | null;

  constructor(shadowLayer: Phaser.Tilemaps.TilemapLayer) {
    this.shadowLayer = shadowLayer;
    this.activeRoom = null;
  }

  setActiveRoom(room: Room) {
    if (room !== this.activeRoom) {
      this.setRoomAlpha(room, 0);
      if (this.activeRoom) this.setRoomAlpha(this.activeRoom, 0.5);
      this.activeRoom = room;
    }
  }

  // Helper to set the alpha on all tiles within a room
  setRoomAlpha(room: Room, alpha: number) {
    this.shadowLayer.forEachTile(
      (t) => (t.alpha = alpha),
      this,
      room.x,
      room.y,
      room.width,
      room.height
    );
  }
}
