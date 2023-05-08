import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
    Engine,
    Scene,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    UniversalCamera, StandardMaterial, Color3, CreateBox, Space, HavokPlugin
} from "@babylonjs/core";
import {GridMaterial, SkyMaterial} from '@babylonjs/materials';
import HavokPhysics from "@babylonjs/havok";

const IS_DEV = true;  // oops will break build I guess, see: https://github.com/michealparks/babylon-template/blob/main/src/physics.ts

export const initPhysics = async (scene: Scene) => {
  // const url = IS_DEV ? 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm' : 'HavokPhysics.wasm'
  const url = 'HavokPhysics.wasm';  // 2023-05-08: watch out I put a copy in public
  const response = await fetch(url)
  const wasmBinary = await response.arrayBuffer()
  const havokInstance = await HavokPhysics({ wasmBinary })
  const havokPlugin = new HavokPlugin(true, havokInstance)
  const gravityVector = new Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, havokPlugin)
}


function moveAgentToAgent(agent: Agent, target: Agent) {
    let targetVec = target.mesh.position;
    const initVec = agent.mesh.position;
    const distVec = Vector3.Distance(targetVec, initVec);

    targetVec = targetVec.subtract(initVec);
    const targetVecNorm = Vector3.Normalize(targetVec);

    if (distVec > 0) {
        // distVec -= 0.1;
        agent.mesh.translate(targetVecNorm, 0.1, Space.WORLD);
        // console.log(agent.mesh.position);
    }
}

class Agent {
    mesh: Mesh;
    wantsToGoToAgent: string;

    constructor(public name: string, public color: Color3, xPos: number, public arena: Arena) {
        if (false) {
            this.mesh = MeshBuilder.CreateSphere(name, {diameter: 1});
        } else {
            this.mesh = CreateBox(name, {size: 1}, arena);
        }
        const mesh = this.mesh;
        mesh.position.y = 0.5;  // Move it up to avoid ground.
        mesh.position.z = 10;
        mesh.position.x = xPos;
        // Below is needed since we use registerBeforeRender, otherwise first translate doesn't work right.
        mesh.computeWorldMatrix(true);

        // Add color.
        const material = new StandardMaterial("sphereMaterial");
        material.alpha = 1;
        material.diffuseColor = color;
        mesh.material = material;
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
    }

    async setup() {
        const scene = this;

        await initPhysics(scene);

        const camera = new UniversalCamera("camera", new Vector3(10, 10, -30), scene);
        camera.attachControl(this.app.canvas, true);

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
    }

    async run() {
        // Get the canvas element
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.canvas = canvas;

        // initialize babylon scene and engine
        const engine = new Engine(canvas, true);
        const scene = new Arena(engine, this);
        await scene.setup();
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

new App().run();
