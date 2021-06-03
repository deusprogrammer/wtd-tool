import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { convertSubtitlesToSrt } from '../util/VideoTools';
import WhatTheDubPlayer from '../components/WhatTheDubPlayer';

let VideoView = (props) => {
    const [videoDetails, setVideoDetails] = useState(null);
    const [videoDataUri, setVideoDataUri] = useState("");
    useEffect(async () =>{
        let result = await axios.get(`https://deusprogrammer.com/api/dubs/videos/${props.match.params.id}`, {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });

        setVideoDetails(result.data);
    }, []);

    return (
        <div>
            {videoDetails ? <div>
                <div>Name: {videoDetails.name}</div>
                <div>
                    {/* <video src={videoDetails.videoUrl} controls/> */}
                    <WhatTheDubPlayer
                        videoSource={videoDetails.videoUrl}
                        isPlaying={false}
                        videoPosition={0}
                        subs={videoDetails.subtitles}
                        onEnd={() => {}}
                        onIndexChange={(index) => {}}
                        onVideoPositionChange={(position) => {}}
                        onVideoLoaded={(video) => {}}
                        controls={true} />
                </div>
                <pre>{convertSubtitlesToSrt(videoDetails.subtitles)}</pre>
            </div> : null}
        </div>
    );
};

export default VideoView;