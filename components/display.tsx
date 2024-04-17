import {CameraFrameProvider} from "./cameraFrameProvider/cameraFramerProvider"
import {FacemeshLandmarksProvider} from "./ladmarks/landmarksProvider"
import {SceneManager} from "./sceneManager/sceneManager";

import { useEffect, useRef } from "react";

const Display = () => {
    const videoRef=useRef<HTMLDivElement>(null);
    const video=useRef<HTMLVideoElement>(null);
    const source=useRef<HTMLSourceElement>(null);
    const canvas=useRef<HTMLCanvasElement>(null);

    //ref is not a prop

    useEffect(() => {
        async function main() {
            if(videoRef.current) {
                videoRef.current.classList.add("loading");
            }

            const useOrtho = true;
            const debug = false;

            let sceneManager:any;
            let facemeshLandmarksProvider:any;
            let videoFrameProvider:any;

            const onLandmarks = ({ image, landmarks }: {image:any, landmarks:any}) => {
                sceneManager.onLandmarks(image, landmarks);
                
            }
            console.log("brk point one");

            const onFrame = async (video:any) => {
                try {
                    await facemeshLandmarksProvider.send(video);
                    console.log("Brk point two");
                } catch (e) {
                    alert("Not Supported on your device")
                    console.error(e);
                    console.log("Brk point two");
                    videoFrameProvider.stop();
                }
            }
            console.log("Break point two");
            function animate() {
                requestAnimationFrame(animate);
                sceneManager.resize(window.innerWidth, window.innerHeight);
                console.log("called");
                sceneManager.animate();
            }
            console.log("Break point three");

            if(canvas.current){
                console.log("Break point four");
                sceneManager = new SceneManager(canvas.current, debug, useOrtho);
                sceneManager.buildGlasses("3d/glasses/scene.gltf");
                console.log("Break point five");
            }

            facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);
            console.log(facemeshLandmarksProvider);

            // const changeGlass = async () => {
            //     sceneManager.glasses.removeGlasses();
            //     sceneManager.buildGlasses("3d/glasses/glft001.gltf");
            //     sceneManager.glasses.addGlasses();
            // }

            // document.querySelectorAll(".glass_one").forEach(glass => {
            //     glass.addEventListener("click", async () => {
            //         await changeGlass();
            //     })
            // })

            // unload video
            if (video.current) {
                video.current.pause();
                
                if(source.current) source.current.remove();
                
                video.current.removeAttribute('src'); 
                video.current.load();
            }

            videoFrameProvider = new CameraFrameProvider(video, onFrame);
            
            console.log(videoFrameProvider);
            
            await facemeshLandmarksProvider.initialize();
            console.log("Test");
            videoFrameProvider.start();
            console.log("Test");
            console.log('Called');
            animate();

            console.log("first")

            if(videoRef.current) videoRef.current.classList.remove("loading");
        }

        if(videoRef.current && video.current && source.current && canvas.current) {
            console.log("Main called");
            main();
        }
    }, [videoRef, video, source, canvas])

    return (
        <div className="video-container" ref={videoRef}>
            <span className="loader">
                Loading ...
            </span>

            <canvas ref={canvas} className="output_canvas"></canvas>

            <div>
                <video ref={video} className="input_video" controls playsInline>
                    <source ref={source} src="${PUBLIC_PATH}/video/videoplayback2.mp4" />
                </video>
            </div>
        </div>
    )
}
export default Display;