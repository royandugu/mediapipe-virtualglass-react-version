import { CameraFrameProvider } from "./cameraFrameProvider/cameraFramerProvider"
import { FacemeshLandmarksProvider } from "./ladmarks/landmarksProvider"
import { SceneManager } from "./sceneManager/sceneManager";

import { useEffect, useRef, useState } from "react";

const Display = () => {
    const videoRef = useRef<HTMLDivElement>(null);
    const video = useRef<HTMLVideoElement>(null);
    const source = useRef<HTMLSourceElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    let onceCalled=false;

    async function main() {
        if (videoRef.current && video.current && source.current && canvas.current) {
            videoRef.current?.classList.add("loading");

 
            const useOrtho = true;
            const debug = false;

            let sceneManager: any;
            let facemeshLandmarksProvider: any;
            let videoFrameProvider: any;

            const onLandmarks = ({ image, landmarks }: { image: any, landmarks: any }) => {
                sceneManager.onLandmarks(image, landmarks);
            }

            const onFrame = async (video: any) => {
                try {
                    await facemeshLandmarksProvider.send(video);
                } catch (e) {
                    alert("Not Supported on your device")
                    console.error(e);
                    videoFrameProvider.stop();
                }
            }

            function animate() {
                requestAnimationFrame(animate);
                sceneManager.resize(window.innerWidth, window.innerHeight);
                sceneManager.animate();
            }

            sceneManager = new SceneManager(canvas.current, debug, useOrtho);
            sceneManager.buildGlasses("3d/black-glasses/scene.gltf");

            facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);

            const changeGlass = async () => {
                sceneManager.glasses.removeGlasses();
                sceneManager.buildGlasses("3d/glasses/glft001.gltf");
                sceneManager.glasses.addGlasses();
            }

            document.querySelectorAll(".glass_one").forEach(glass => {
                glass.addEventListener("click", async () => {
                    await changeGlass();
                })
            })

            videoFrameProvider = new CameraFrameProvider(video.current, onFrame);

            await facemeshLandmarksProvider.initialize();
            videoFrameProvider.start();

            animate();

            videoRef.current?.classList.remove("loading");
        }
    }

    useEffect(() => {
        if(!onceCalled){
            console.log("Model called");
            main();
            onceCalled=true;
        }
    }, [videoRef, canvas, video, source]) 

    return (
        <div className="video-container" ref={videoRef}>
            <span className="loader">
                Loading ...
            </span>

            <canvas ref={canvas} className="output_canvas"></canvas>

            <div>
                <video ref={video} className="input_video" controls playsInline>
                    <source ref={source} src=" " />
                </video>
            </div>
        </div>
    )
}
export default Display;