import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { convertSubtitlesToSrt } from '../util/VideoTools';

let VideoView = (props) => {
    const [videoDetails, setVideoDetails] = useState(null);
    useEffect(async () =>{
        let result = await axios.get(`https://deusprogrammer.com/api/dubs/videos/${props.match.params.id}`, {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });

        setVideoDetails(result.data);
    }, []);

    let getVideo = async () => {
        let results = await axios.get(`https://deusprogrammer.com/api/dubs/videos/${videoDetails._id}/mp4`, {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });

        let base64ByteArray = Buffer.from(results.data, 'binary').toString('base64');
        return `data:video/mp4;base64,${base64ByteArray}`;
    }

    return (
        <div>
            {videoDetails ? <div>
                <div>Name: {videoDetails.name}</div>
                <div><video src={} controls/></div>
                <pre>{convertSubtitlesToSrt(videoDetails.subtitles)}</pre>
            </div> : null}
        </div>
    );
};

export default VideoView;