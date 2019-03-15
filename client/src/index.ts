import "./index.css";

import * as BABYLON from "babylonjs";
import { room } from "./game/network";

var players = {};

// Listen to patches comming
room.onStateChange.add(function(patches) {
    console.log("Server state changed: ", patches);
});

const canvas = document.getElementById('game') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
var createScene = function () {

    var scene = new BABYLON.Scene(engine);

    // Lights
    var light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);
    var light1 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(2, -5, -2), scene);

    // Need a free camera for collisions
    var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -20), scene);
    camera.attachControl(canvas, true);

    //Ground
    var ground = BABYLON.Mesh.CreatePlane("ground", 20.0, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.backFaceCulling = false;
    ground.position = new BABYLON.Vector3(5, -10, -15);
    ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    room.listen("players/:id", function (change) {
        if (change.operation === "add") {
            var box = BABYLON.Mesh.CreateBox("crate", 2, scene);
            box.material = new BABYLON.StandardMaterial("Mat", scene);
            box.position = new BABYLON.Vector3(3, 0, -10);
            box.ellipsoid = new BABYLON.Vector3(1, 1, 1);

            scene.registerBeforeRender(function () {
                box.moveWithCollisions(scene.gravity);
            });

            box.checkCollisions = true;
            players[change.path.id] = box;
            
        } else if (change.operation === "remove") {
            delete players[change.path.id];
        }
    });

    room.listen("players/:id/:axis", function (change) {
        var box = players[change.path.id];
        if (change.path.axis === "x") {
            box.moveWithCollisions(new BABYLON.Vector3(-distance, 0, 0))
        }
    });


    //Simple crate
    // var box = BABYLON.Mesh.CreateBox("crate", 2, scene);
    // box.material = new BABYLON.StandardMaterial("Mat", scene);
    // // box.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
    // // box.material.diffuseTexture.hasAlpha = true;
    // box.position = new BABYLON.Vector3(2, -5, -10);
    // box.ellipsoid = new BABYLON.Vector3(1, 1, 1);


    //box2
    var box1 = BABYLON.Mesh.CreateBox("crate", 2, scene);
    box1.material = new BABYLON.StandardMaterial("Mat", scene);
    box1.position = new BABYLON.Vector3(3, 0, -10);
    box1.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    scene.registerBeforeRender(function () {
        // box.moveWithCollisions(scene.gravity);
        box1.moveWithCollisions(scene.gravity);
    })

    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new BABYLON.Vector3(0, -0.1, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;

    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;

    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    //finally, say which mesh will be collisionable
    ground.checkCollisions = true;
    // box.checkCollisions = true;
    box1.checkCollisions = true;

    var inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = evt.sourceEvent.type == "keydown";
    }));

    // Game/Render loop
    var distance = .1;
    scene.onBeforeRenderObservable.add(() => {
        if (inputMap["w"] || inputMap["ArrowUp"]) {
            // box.moveWithCollisions(new BABYLON.Vector3(0, 0, distance))
            room.send({ z: distance });
        }
        if (inputMap["a"] || inputMap["ArrowLeft"]) {
            // box.moveWithCollisions(new BABYLON.Vector3(-distance, 0, 0))
            room.send({ x: distance });
        }
        if (inputMap["s"] || inputMap["ArrowDown"]) {
            // box.moveWithCollisions(new BABYLON.Vector3(0, 0, -distance))
            room.send({ z: distance });
        }
        if (inputMap["d"] || inputMap["ArrowRight"]) {
            // box.moveWithCollisions(new BABYLON.Vector3(distance, 0, 0))
            room.send({ x: distance });
        }
        if (inputMap[" "]) {
            // box.moveWithCollisions(new BABYLON.Vector3(0, .4, 0))
            room.send({ y: distance });
        }
    })
    return scene;
}

// Scene render loop
var scene = createScene();

engine.runRenderLoop(function() {
    scene.render();
});

// Resize the engine on window resize
window.addEventListener('resize', function() {
    engine.resize();
});