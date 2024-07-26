import * as THREE from 'three';
import { Glasses } from '../glasses/glasses';
import { VideoBackground } from '../videoBg/videoBg';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
/**
 * 
 * Finds distance to position perspective camera
 * 
 * @param {Number} height height of video 
 * @param {Number} fov fov of perspective camera
 */
const cameraDistance = (height:number, fov:number) => {
  return (height / 2) / Math.tan((fov/2) * Math.PI / 180);
}

/**
 * 
 * Call these methods.
 * 
 * 1) animate inside request animation frame
 * 2) resize inside request animation frame
 * 3) onLandmarks on recieving new face landmarks
 * 
 */
export class SceneManager {
  canvas:any;
  scene:any;
  debug:boolean;
  useOrtho:boolean;
  renderer:any;
  fov:number;
  videoBg:any;
  glasses:any;
  controls:any;
  camera:any;
  videoWidth:number;
  videoHeight:number;
  constructor(canvas:any, light:any,debug=false, useOrtho=false) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.add(light);
    this.debug = debug;
    this.useOrtho = useOrtho;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.fov = 63;
    this.buildCamera();
    this.buildControls(); 
    this.buildVideoBg();
    this.videoWidth=0;
    this.videoHeight=0;
  }

  buildVideoBg() {
    // video background for canvas
    this.videoBg = new VideoBackground(this.scene, 
      this.renderer.domElement.width, 
      this.renderer.domElement.height
    );
  }

  buildGlasses(url:string, toChange:boolean) {
    this.glasses = new Glasses(this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    )
    if(toChange){
      this.glasses.removeGlasses();
    }
    this.glasses.loadGlasses(url);
  }

  buildControls() {
    if (this.debug) {
      this.controls = new OrbitControls(
        this.camera, this.renderer.domElement 
      );
      this.controls.update();
    }
  }

  buildCamera() {
    this.useOrtho ? this.buildOrthoCamera() : this.buildPerspectiveCamera();
  }

  buildOrthoCamera() {
    this.camera = new THREE.OrthographicCamera(
      - this.renderer.domElement.width / 2,
      this.renderer.domElement.width / 2,
      this.renderer.domElement.height / 2,
      - this.renderer.domElement.height / 2,
      -2000, 
      2000
    )
    this.camera.position.z = 1
  }

  buildPerspectiveCamera() {

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.renderer.domElement.width / this.renderer.domElement.height,
      1.0, // near
      10000, // far
    )

    this.camera.position.z = cameraDistance(
      this.renderer.domElement.height, 
      this.fov
    ); 
  }

  // we need to resize canvas rendering dimensions
  // when canvas sytling dimensions change
  resizeRendererToDisplaySize() {

    const canvas = this.renderer.domElement;

    // match dimension of canvas with
    // dimension of video
    if (this.videoWidth != canvas.clientWidth
      || this.videoHeight != canvas.clientHeight) {
      const width = this.videoWidth;
      const height = this.videoHeight;
      canvas.style.width =  `${width}px`;
      canvas.style.height = `${height}px`;
    }

    // canvas has 2 width
    // 1) style width set with style attribute
    // 2) rendering width set with width and height attribute
    // update rendering width to match styling width.
    const width  = canvas.clientWidth | 0;
    const height = canvas.clientHeight | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }

  updateCamera() {
    // camera need to be adjusted according to
    // renderer dimensions
    this.camera.aspect = this.videoWidth / this.videoHeight;
    if (this.camera.type == 'OrthographicCamera') {
      this.camera.top = this.videoHeight / 2
      this.camera.bottom = -this.videoHeight / 2
      this.camera.left = -this.videoWidth / 2
      this.camera.right = this.videoWidth / 2  
    } else {
      this.camera.position.z = cameraDistance(this.videoHeight, this.fov);
    }
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update();
    }

    if (this.resizeRendererToDisplaySize()) {
      this.glasses.updateDimensions(
        this.renderer.domElement.width,
        this.renderer.domElement.height,
      )

      // update video width and height
      this.videoBg.updateDimensions(
        this.renderer.domElement.width, 
        this.renderer.domElement.height
      );

      this.updateCamera();
    }


    // update video background
    this.videoBg.update();

    // update glasses
    this.glasses.update();

    // render scene
    this.renderer.render(this.scene, this.camera);
  }

  resize(videoWidth:number, videoHeight:number) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }

  onLandmarks(image:any, landmarks:any) {
    if (image && landmarks) {
      this.videoBg.setImage(image);
      this.glasses.updateLandmarks(landmarks);
    }
  }
}