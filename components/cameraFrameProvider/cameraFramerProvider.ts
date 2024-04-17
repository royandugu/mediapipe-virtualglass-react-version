import { Camera } from '@mediapipe/camera_utils';

export class CameraFrameProvider {
  camera:any
  constructor(videoElement:any, onFrame:any) {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        onFrame(videoElement)
      },
      width: window.innerWidth,
      height: window.innerHeight,
    },);
    this.camera = camera;
  }

  start() {
    this.camera.start();
  }

  stop() {
    this.camera.stop();
  }
}