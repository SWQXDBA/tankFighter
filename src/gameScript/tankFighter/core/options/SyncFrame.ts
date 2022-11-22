import {PlayerOption} from "./PlayerOption";

export class SyncFrame {
  frameIndex: number | undefined;
  gameId: number | undefined;
  timeStamp: number | undefined;
  options: Map<number, PlayerOption> = new Map<number, PlayerOption>();
}
