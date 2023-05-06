import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import {GridMaterial} from '@babylonjs/materials';

class Arena extends Scene {
    constructor(engine: Engine, public app: App) {
        super(engine);

        const scene = this;
        const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        camera.attachControl(app.canvas, true);

        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        ground.checkCollisions = true;
        ground.material = new GridMaterial("mat", scene as any) as any;
    }
}

class App {
    canvas: HTMLCanvasElement;
    constructor() {
        // create the canvas html element and attach it to the webpage
        const canvas = document.createElement("canvas");
        this.canvas = canvas;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        const engine = new Engine(canvas, true);
        const scene = new Arena(engine, this);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (scene.debugLayer.isVisible()) {
                    scene.debugLayer.hide();
                } else {
                    scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();
