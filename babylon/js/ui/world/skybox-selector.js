import { Skybox } from "../../world/skybox.js";
import { World } from "../../world/world.js";

export class SkyboxSelector {
  /**
   * @param {World} world 
   */
  constructor(world) {
    this.world = world;
    this.boxes = [];
    // add own selection predicate to the world
    this.selectionPredicate = (mesh) => this.isSelectableMesh(mesh);
    world.addSelectionPredicate(this.selectionPredicate);
    world.addListener(this);
    this.sharedSkybox = null;
  }

  entered(welcome) {
    //console.log(welcome);
    if (welcome.permanents) {
      welcome.permanents.forEach(obj => {
        if (obj.Background) {
          this.skyboxChanged(obj.Background);
        }
      });
    }
  }

  added(added) {
    if (added && added.className == "Background") {
      console.log("Skybox added", added);
      this.sharedSkybox = added;
      added.addListener((obj, change) => this.skyboxChanged(change));
    }
  }

  skyboxChanged(change) {
    this.world.skyBox.dir = change.texture;
    this.world.skyBox.dispose();
    this.world.skyBox.create();
    // TODO
  }

  async createSharedSkybox() {
    var object = {
      permanent: true,
      active: true
    };
    let obj = await this.world.worldManager.VRSPACE.createSharedObject(object, "Background");
    console.log("Created new Skybox", obj);
    this.sharedSkybox = obj;
  }

  makeSkyBox(dir) {
    var skybox = new Skybox(this.scene, dir);
    skybox.infiniteDistance = false;
    skybox.size = 1;
    skybox.create();
    return skybox;
  }

  show() {
    var skyboxes = new Set();
    var anchor = new BABYLON.TransformNode("anchor");
    var forwardDirection = VRSPACEUI.hud.camera.getForwardRay(6).direction;
    anchor.position = VRSPACEUI.hud.camera.position.add(forwardDirection);
    anchor.rotation = new BABYLON.Vector3(VRSPACEUI.hud.camera.rotation.x, VRSPACEUI.hud.camera.rotation.y, VRSPACEUI.hud.camera.rotation.z);
    //console.log("Anchor position: ", anchor.position);
    // TODO: this often causes UI elements being below ground level
    // we could cast a ray down and calc position to put the panel on top of ground or whatever is below it

    this.panel = new BABYLON.GUI.CylinderPanel();
    this.panel.margin = .2;
    var manager = VRSPACEUI.guiManager;
    manager.addControl(this.panel);
    this.panel.linkToTransformNode(anchor);

    VRSPACEUI.listMatchingFiles(VRSPACEUI.contentBase + "/content/skybox/", list => {
      // list is ServerFolder array
      list.forEach(sf => {
        // sf is ServerFolder object
        VRSPACEUI.listDirectory(sf.url(), skyboxDir => {
          skyboxDir.forEach(f => {
            // f is an individual file
            // name is directoryUrl+skyboxName+_axis+.jpg
            var skyboxName = f.substring(f.lastIndexOf("/") + 1, f.lastIndexOf("_"));
            // images not ending with _px, _nx etc (panoramic) do not parse well here, e.g.
            // https://localhost/content/skybox/eso_milkyway/eso0932a.jpg
            // and we get wrong name, e.g. _milkyway/ so just skip them
            if (!skyboxName.startsWith("_")) {
              // and this is what we need to create cubeTexture:
              var skyboxDir = f.substring(0, f.lastIndexOf("_"));
              //console.log(f, skyboxName, skyboxDir);
              if (!skyboxes.has(skyboxDir)) {
                skyboxes.add(skyboxDir);
                var box = this.makeSkyBox(skyboxDir);
                //box.position = new BABYLON.Vector3(skyboxes.size*2, 1, 0);
                var button = new BABYLON.GUI.MeshButton3D(box.skybox, "pushButton-" + skyboxName);
                button.onPointerDownObservable.add(() => this.sendChange(box.dir));
                this.boxes.push(box.skybox);
                this.panel.addControl(button);
              }
            }
          });
        }, ".jpg");
      });
    });

  }
  async sendChange(dir) {
    if (!this.sharedSkybox) {
      await this.createSharedSkybox();
    }
    this.world.worldManager.VRSPACE.sendEvent(this.sharedSkybox, { texture: dir });
  }

  hide() {
    this.panel.dispose();
    this.boxes = [];
  }

  dispose() {
    this.hide();
    this.world.removeSelectionPredicate(this.selectionPredicate);
    this.world.removeListener(this);
  }

  isSelectableMesh(mesh) {
    return this.boxes.includes(mesh);
  }

}