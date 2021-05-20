import React, {useState, useEffect} from 'react';
import axios from 'axios';

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
        saveAs(zip.data, `${name}.zip`);
    }

    return (
        <div>
            <h3>Video List</h3>
            {videos.map((video) => {
                return (
                    <div><a onClick={() => {getZip(video.id, video.name)}} download>{video.name}</a></div>
                )
            })}
        </div>
    );
}

export default VideoList;