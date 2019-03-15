import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { Player } from "../entities/Player";

export class GameRoom extends Room<StateHandler> {
    maxClients = 8;

    onInit (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler());
    }

    requestJoin (options) {
        return true;
    }

    onJoin (client) {
        let player = new Player({
            name: `Player ${ this.clients.length }`,
            x: Number(2),
            y: Number(-5),
            z: Number(-10)
        });

        this.state.addPlayer(client.id, player);
    }

    onMessage (client: Client, data: any) {
        this.state.movePlayer(client.id, data)
    }

    onUpdate () {
        this.state.update();
    }

    onLeave (client) {
        this.state.removePlayer(client.id);
    }

    onDispose () {
    }

}
