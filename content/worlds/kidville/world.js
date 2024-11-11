import { World, Skybox } from '../../../babylon/js/vrspace-min.js';

export class Kidville extends World {
  
  async createCamera() {
    // Add a camera to the scene and attach it to the scene
    this.camera = this.firstPersonCamera(new BABYLON.Vector3(-97.51, 10, 62.72));
    this.camera.speed = 1;
    this.camera.setTarget(new BABYLON.Vector3(0,0,0));
    //this.thirdPersonCamera(); // too slow
  }
  
  async createLights() {
    var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -1, 0), this.scene);
    light.intensity = 2;
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
    return light1;
  }
  
  async createSkyBox() {
    return new Skybox(this.scene, "https://www.babylonjs.com/assets/skybox/TropicalSunnyDay").create();
  }
  
  getFloorMeshes() {
    return [this.scene.getMeshByName('Object013')];
  }
  
  isSelectableMesh(mesh) {
    return mesh.name == "node167" || mesh.name == "node3" || mesh.name == "node30" || mesh.name == "node31" || super.isSelectableMesh(mesh);
  }
  
  loaded(file, mesh) {
    super.loaded(file, mesh);
    mesh.scaling = new BABYLON.Vector3(0.5,0.5,0.5);
  }
  
}

export const WORLD = new Kidville();