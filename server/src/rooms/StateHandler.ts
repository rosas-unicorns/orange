import { EntityMap } from "colyseus";
import { Player } from "../entities/Player";

export class StateHandler {

    players: EntityMap<Player> = {};

    update (): void {
        //
        // Implement your server-side game loop here
        //
    }

    movePlayer (clientId: string, move: any): void {
        if (move.x) {
            this.players[ clientId ].x += move.x;
        } if (move.y) {
            this.players[ clientId ].y += move.y;
        } if (move.z) {
            this.players[ clientId ].z += move.z
        }
    }

    addPlayer (clientId: string, player: Player): void {
        this.players[ clientId ] = player;
    }

    getPlayer (clientId: string): Player {
        return this.players[ clientId ];
    }

    removePlayer (clientId): void {
        delete this.players[ clientId ];
    }

}
