import * as THREE from "three";

import { useEffect, useRef } from "react";

import { CameraFrameProvider } from "./cameraFrameProvider/cameraFramerProvider"
import { FacemeshLandmarksProvider } from "./ladmarks/landmarksProvider"
import { SceneManager } from "./sceneManager/sceneManager";

import ListOfGlasses from "./listOfGlasses/listOfGlasses";

const Display = () => {
    const videoRef = useRef<HTMLDivElement>(null);
    const video = useRef<HTMLVideoElement>(null);
    const source = useRef<HTMLSourceElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    let onceCalled = false;

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

            // Directional Light - Left
            const directionalLightLeft = new THREE.DirectionalLight(0xffffff, 1); 
            directionalLightLeft.position.set(50, 0, 120); // Position light to the left
            directionalLightLeft.castShadow = true; // Enable shadow casting


            // // Directional Light - Right
            // const directionalLightRight = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity
            // directionalLightRight.position.set(10, 10, 10); // Position light to the right
            // directionalLightRight.castShadow = true; // Enable shadow casting
            // scene.add(directionalLightRight);

            sceneManager = new SceneManager(canvas.current, directionalLightLeft, debug, useOrtho);
            sceneManager.buildGlasses("3d/two-glasses/face_rigged.gltf");

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
        if (!onceCalled) {
            main();
            onceCalled = true;
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
            
            <ListOfGlasses />
        </div>
    )
}
export default Display;