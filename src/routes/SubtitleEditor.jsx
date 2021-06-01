import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import WhatTheDubPlayer from '../components/WhatTheDubPlayer';

let SubtitleEditor = (props) => {
    const [videoSource, setVideoSource] = useState("");
    const [subs, setSubs] = useState([]);
    const [videoName, setVideoName] = useState("Video");
    const [currentSub, setCurrentSub] = useState(null);
    const [substitution, setSubstitution] = useState("");
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [currentSliderPosition, setCurrentSliderPosition] = useState(0);

    const [videoLength, setVideoLength] = useState(0);

    let newSub = (startTime) => {
        setSubs([...subs, {
            startTime,
            endTime: startTime,
            text: ""
        }]);
        setCurrentSub((subs.length - 1) + 1);
    }

    let setStart = (startTime) => {
        let prev = [...subs];
        prev[currentSub] = {
            startTime,
            endTime: startTime,
            text: ""
        };
        setSubs(prev);
    }

    let setEnd = (endTime) => {
        let prev = [...subs];
        prev[currentSub] = {
            ...prev[currentSub],
            endTime
        };
        setSubs(prev);
    }

    let setText = (text) => {
        let prev = [...subs];
        prev[currentSub] = {
            ...prev[currentSub],
            text
        };
        setSubs(prev);
    }

    let onFileOpen = (e) => {
        let f = e.target.files[0];
        let fr = new FileReader();
        fr.onload = () => {
            setVideoSource(fr.result);
        }

        fr.readAsDataURL(f);
    }

    let convertSecondsToTimestamp = (seconds) => {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        let ms = Math.floor((seconds - Math.trunc(seconds)) * 1000);
    
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
    }

    let scrub = (seconds) => {
        setCurrentPosition(seconds);
        setCurrentSliderPosition(seconds);
        setIsPlaying(false);
    }

    let upload = async () => {
        try {
            setButtonsDisabled(true);
            let {_id} = await axios.post("https://deusprogrammer.com/api/img-svc/media", {
                title: videoName,
                mimeType: "video/mp4",
                imagePayload: videoSource.substring(videoSource.indexOf(',') + 1)
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": localStorage.getItem("accessToken")
                }
            });
            await axios.post("https://deusprogrammer.com/api/dubs/videos", {
                name: videoName,
                subtitles: subs,
                videoUrl: `https://deusprogrammer.com/api/img-svc/media/${_id}/file`
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Token": localStorage.getItem("accessToken")
                }
            });
            setButtonsDisabled(false);
            toast(`Video uploaded successfully!`, {type: "info"});
        } catch (error) {
            toast(`Video upload failed!`, {type: "error"});
        }
    }

    return (
        <div>
            <h3>Twitch Editor</h3>
            { videoSource ?
                <div>
                    <div style={{display: "table", margin: "auto"}}>
                        <div style={{display: "table-cell", verticalAlign: "middle"}}>
                            <h3>Video</h3>
                            <WhatTheDubPlayer
                                videoSource={videoSource}
                                isPlaying={isPlaying}
                                videoPosition={currentPosition}
                                subs={subs}
                                substitution={substitution}
                                onEnd={() => {
                                    setIsPlaying(false);
                                }}
                                onIndexChange={(index) => {
                                    setCurrentSub(index);
                                }}
                                onVideoPositionChange={(position) => {
                                    setCurrentSliderPosition(position);
                                }}
                                onVideoLoaded={(video) => {
                                    setVideoLength(video.duration);
                                }} />
                            <div>
                                <button onClick={() => {scrub(Math.max(0, currentPosition - (1/60)))}}>&lt;</button>
                                {!isPlaying ? <button onClick={() => {setIsPlaying(true);}}>Play</button> :<button onClick={() => {setIsPlaying(false);}}>Pause</button>}
                                <button onClick={() => {scrub(currentPosition + (1/60))}}>&gt;</button>
                            </div>
                            <div>
                                <input 
                                    type="range" 
                                    style={{width: "300px", padding: "0px", margin: "0px"}} 
                                    value={currentSliderPosition} 
                                    step={1/60}
                                    max={videoLength}
                                    onChange={(e) => {scrub(e.target.value)}} />
                                <div style={{width: "300px", height: "25px", position: "relative"}}>
                                    <div style={{position: "absolute", left: currentSliderPosition/videoLength * 300 + "px", width: "2px", height: "20px", backgroundColor: "black", zIndex: 9999}} />
                                    {subs.map((sub, index) => {
                                        return (
                                            <div 
                                            onClick={() => {
                                                setCurrentSub(index);
                                            }}
                                            style={{
                                                position: "absolute",
                                                left: (300 * (sub.startTime/videoLength)) + "px",
                                                width: (300 * ((sub.endTime - sub.startTime)/videoLength)) + "px",
                                                height: "20px",
                                                backgroundColor: "yellow",
                                                border: "1px solid black",
                                                cursor: "pointer"
                                            }}>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            {/* <label>Substitution</label><input type="text" value={substitution} onChange={(e) => {setSubstitution(e.target.value)}} /> */}
                        </div>
                        <div style={{display: "table-cell"}}>
                            <div>
                                <label>Video Title</label><input type="text" value={videoName} onChange={(e) => {setVideoName(e.target.value)}} />
                            </div>
                            <div>
                                <h3>Current Subtitle</h3>
                                { currentSub !== null ?
                                    <table style={{margin: "auto"}}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {setStart(currentSliderPosition)}}>Set Start</button>
                                                </td>
                                                <td>
                                                    <span>{convertSecondsToTimestamp(subs[currentSub].startTime)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {scrub(subs[currentSub].startTime)}}>Show Start</button>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {setEnd(currentSliderPosition)}}>Set End</button>
                                                </td>
                                                <td>
                                                    <span>{convertSecondsToTimestamp(subs[currentSub].endTime)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <button type="button" onClick={() => {scrub(subs[currentSub].endTime)}}>Show End</button>
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <label>Subtitle:</label>
                                                </td>
                                                <td>
                                                    <input 
                                                        type="text"
                                                        style={{width: "200px"}}  
                                                        value={subs[currentSub].text} 
                                                        onChange={(e) => {setText(e.target.value)}} 
                                                        placeholder="Text, [male_dub], or [female_dub]" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    :
                                    null
                                }
                            </div>
                        </div>
                        <div style={{display: "table-cell"}}>
                            <h3>Subtitles</h3>
                            <div>
                                <table style={{margin: "auto"}}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Start</th>
                                            <th></th>
                                            <th>Stop</th>
                                            <th>Text</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        subs.sort((a, b) => {
                                            return a.startTime - b.startTime;
                                        }).map((sub, index) => {
                                            return (
                                                <tr 
                                                    style={{
                                                        cursor: "pointer", 
                                                        backgroundColor: index === currentSub ? "blue" : "white", 
                                                        color: index === currentSub ? "white" :"black"
                                                    }}
                                                    key={`sub${index}`}
                                                    className="subs"
                                                    onClick={() => {setCurrentSub(index); scrub(sub.startTime);}}>
                                                        <td>{index + 1}</td><td>{convertSecondsToTimestamp(sub.startTime)}</td><td>==&gt;</td><td>{convertSecondsToTimestamp(sub.endTime)}</td><td style={{width: "150px", textOverflow: "ellipsis"}}>{sub.text === "[male_dub]" || sub.text === "[female_dub]" ? sub.text  : `"${sub.text}"`}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </table>
                                <button type="button" onClick={() => {newSub(currentSliderPosition)}}>New Subtitle</button>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <button type="button" onClick={() => {upload()}} disabled={buttonsDisabled}>Upload</button>
                </div>
                :
                <div>
                    <p>Please choose the video you wish to add subtitles to.  Note that the file needs to already be trimmed to the length you want it.</p>
                    <input type="file" accept=".mp4" onChange={onFileOpen} />
                </div>
            }
        </div>
    );
}

export default SubtitleEditor;
