import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {saveAs} from 'file-saver';

let VideoList = () => {
    const [videos, setVideos] = useState([]);
    useEffect(async() => {
        let result = await axios.get("https://deusprogrammer.com/api/dubs/videos", {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });
        setVideos(result.data);
    }, []);

    let getZip = async (id, name) => {
        let zip = await axios.get(`https://deusprogrammer.com/api/dubs/videos/${id}/zip`, {
            headers: {
                "X-Access-Token": localStorage.getItem("accessToken")
            }
        });
        saveAs(zip.data.dataUri, `${name}.zip`);
    }

    return (
        <div>
            <h3>Video List</h3>
            {videos.map((video) => {
                return (
                    <div style={{cursor: "pointer"}} onClick={() => {getZip(video._id, video.name)}} download>{video.name}</div>
                )
            })}
        </div>
    );
}

export default VideoList;