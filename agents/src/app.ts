import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    UniversalCamera, StandardMaterial, Color3, CreateBox
} from "@babylonjs/core";
import {GridMaterial, SkyMaterial} from '@babylonjs/materials';

class Agent {
    constructor(public color: Color3, xPos: number) {
        const sphere: Mesh = MeshBuilder.CreateSphere("sphere", {diameter: 1});
        sphere.position.y = 0.5;  // Move it up to avoid ground.
        sphere.position.z = 10;
        sphere.position.x = xPos;

        // Add color.
        const material = new StandardMaterial("sphereMaterial");
        material.alpha = 1;
        material.diffuseColor = color;
        sphere.material = material;
    }
}

class Arena extends Scene {
    agents: Agent[] = [];
    constructor(engine: Engine, public app: App) {
        super(engine);

        const scene = this;
        const camera= new UniversalCamera("camera", new Vector3(10, 10, -30), scene);
        camera.attachControl(app.canvas, true);

        /*const light1: HemisphericLight =*/ new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        ground.checkCollisions = true;
        ground.material = new GridMaterial("mat", scene as any) as any;

        this.addSkyMaterial();
        this.addAgents();
        scene.registerBeforeRender(() => {

        });
    }

    addSkyMaterial(): void {
        const skyMaterial = new SkyMaterial("skyMaterial", this);
        skyMaterial.backFaceCulling = false;
        skyMaterial.inclination = 0;
        skyMaterial.turbidity = 0.5;
        skyMaterial.cameraOffset.y = 0;
        const skybox = CreateBox("skyBox", {size: 10000.0}, this);
        skybox.material = skyMaterial;
    }

    addAgents(): void {
        const agents = [
            new Color3(1.0, 0, 0),
            new Color3(0, 1.0, 0),
            new Color3(0, 0, 1.0)];
        let xPos = 0;
        for(const color of agents) {
            this.agents.push(new Agent(color, xPos));
            xPos += 10;
        }
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
