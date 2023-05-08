import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    UniversalCamera, StandardMaterial, Color3, CreateBox, Space
} from "@babylonjs/core";
import {GridMaterial, SkyMaterial} from '@babylonjs/materials';

function moveAgentToAgent(agent: Agent, target: Agent) {
    console.log("moveAgentToAgent");

    let targetVec = target.mesh.position;
    const initVec = agent.mesh.position;
    const distVec = Vector3.Distance(targetVec, initVec);

    targetVec = targetVec.subtract(initVec);
    const targetVecNorm = Vector3.Normalize(targetVec);

    if (distVec > 0) {
        // distVec -= 0.1;
        agent.mesh.translate(targetVecNorm, 0.1, Space.WORLD);
        console.log(agent.mesh.position);
    }
}

class Agent {
    mesh: Mesh;
    wantsToGoToAgent: string;

    constructor(public name: string, public color: Color3, xPos: number, public arena: Arena) {
        const sphere: Mesh = MeshBuilder.CreateSphere(name, {diameter: 1});
        this.mesh = sphere;
        sphere.position.y = 0.5;  // Move it up to avoid ground.
        sphere.position.z = 10;
        sphere.position.x = xPos;
        // Below is needed since we use registerBeforeRender, otherwise first translate doesn't work right.
        sphere.computeWorldMatrix(true);

        // Add color.
        const material = new StandardMaterial("sphereMaterial");
        material.alpha = 1;
        material.diffuseColor = color;
        sphere.material = material;
    }

    run() {
        if (this.wantsToGoToAgent) {
            const target = this.arena.findAgent(this.wantsToGoToAgent);
            moveAgentToAgent(this, target);
        }
    }
}

class Arena extends Scene {
    agents: Agent[] = [];

    constructor(engine: Engine, public app: App) {
        super(engine);

        const scene = this;
        const camera = new UniversalCamera("camera", new Vector3(10, 10, -30), scene);
        camera.attachControl(app.canvas, true);

        new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        const ground = MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        ground.checkCollisions = true;
        ground.material = new GridMaterial("mat", scene as any) as any;

        this.addSkyMaterial();
        this.addAgents();
        scene.registerBeforeRender(() => {
            this.agents.forEach(agent => agent.run());
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
        const agents: [string, Color3][] = [
            ["red", new Color3(1.0, 0, 0)],
            ["green", new Color3(0, 1.0, 0)],
            ["blue", new Color3(0, 0, 1.0)]];
        let xPos = 0;
        for (const [name, color] of agents) {
            this.agents.push(new Agent(name, color, xPos, this));
            xPos += 10;
        }
        this.findAgent("green").wantsToGoToAgent = "blue";
    }

    findAgent(name: string): Agent {
        const found = this.agents.find(agent => agent.name === name);
        return found;
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
        setTimeout(() => {
            this.canvas.tabIndex = 1;  // Need to do this before calling focus().
            this.canvas.focus();
        }, 0);

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
