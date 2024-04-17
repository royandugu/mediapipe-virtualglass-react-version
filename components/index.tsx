const Index = () => {
    return (
        <div className="video-container">
            <span className="loader">
                Loading ...
            </span>

            <canvas className="output_canvas"></canvas>
            
            <div>
                <video className="input_video" controls playsInline>
                    <source src="${PUBLIC_PATH}/video/videoplayback2.mp4" />
                </video>
            </div>
        </div>
    )
}
export default Index;