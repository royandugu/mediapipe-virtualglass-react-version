import { FaceMesh } from '@mediapipe/face_mesh';
import {transformLandmarks} from "../ladmarks/landmarksHelper";

export class FacemeshLandmarksProvider {
 callback:any;
 faceMesh:any;
 constructor(callback : any) {
    this.callback = callback;
    this.faceMesh = null;
  }

  send(image:any) {
    return this.faceMesh.send({image: image});
  }

  onResults({ image, multiFaceLandmarks }: {image:any, multiFaceLandmarks:any}) {
    if (image != null && multiFaceLandmarks != null) {
      multiFaceLandmarks = transformLandmarks(multiFaceLandmarks[0]);
      this.callback({
        image: image,
        landmarks: multiFaceLandmarks
      });
    }
  }

  async initialize() {
    let onResults = this.onResults.bind(this);

    this.faceMesh = new FaceMesh({locateFile: (file) => {
      let url =  `/mediapipe/${file}`;
      return url
    }});
  
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      useCpuInference: true,
    });
  
    this.faceMesh.onResults(onResults);
  
    await this.faceMesh.initialize();
  }
}