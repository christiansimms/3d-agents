import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    UniversalCamera, BoxBuilder
} from "@babylonjs/core";
import {GridMaterial, SkyMaterial} from '@babylonjs/materials';

class Arena extends Scene {
    constructor(engine: Engine, public app: App) {
        super(engine);

        const scene = this;
        const camera= new UniversalCamera("camera", new Vector3(0, 10, -20), scene);
        camera.attachControl(app.canvas, true);

        const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        ground.checkCollisions = true;
        ground.material = new GridMaterial("mat", scene as any) as any;

        this.addSkyMaterial();
    }

    addSkyMaterial(): void {
        const skyMaterial = new SkyMaterial("skyMaterial", this);
        skyMaterial.backFaceCulling = false;
        skyMaterial.inclination = 0;
        skyMaterial.turbidity = 0.5;
        skyMaterial.cameraOffset.y = 0;
        const skybox = BoxBuilder.CreateBox("skyBox", {size: 10000.0}, this);
        skybox.material = skyMaterial;
    }
}

class App {
    canvas: HTMLCanvasElement;
    constructor() {
        // Get the canvas element
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.canvas = canvas;

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
