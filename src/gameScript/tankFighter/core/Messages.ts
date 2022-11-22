import {PlayerOption} from "./options/PlayerOption";
import {SyncFrame} from "./options/SyncFrame";

/** serverToClient **/
export enum ServerMessageType{
  GAME_INIT, SYNC_FRAME
}
export class ServerMessageJsonBox{
  messageType: ServerMessageType|undefined;
  contextJson: string|undefined;
}

export class SyncFrameMessage{
  frame: SyncFrame|undefined
}

export class GameInitMessage{
  playerId:number|undefined
}

/** clientToServer **/
export enum  ClientMessageType {
  CLIENT_INIT, SYNC_FRAME, FRAME_REQUEST
}
export class ClientMessageJsonBox {
  messageType: ClientMessageType | undefined;
  contextJson: String | undefined;
}
export class InitMessage{
  gameId: number|undefined
}
export class ClientFrameMessage {
   gameId: number| undefined
   frameIndex: number| undefined
   option: PlayerOption| undefined
}

