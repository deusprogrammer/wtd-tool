import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { convertSubtitlesToSrt } from '../util/VideoTools';

let VideoView = (props) => {
    const [videoDetails, setVideoDetails] = useState({});
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
            <div>Name: {videoDetails.name}</div>
            <div><video src={`https://deusprogrammer.com/api/dubs/videos/${videoDetails._id}/mp4`} controls/></div>
            <div>{convertSubtitlesToSrt(videoDetails.subtitles)}</div>
        </div>
    );
};

export default VideoView;