import React, {useState} from 'react';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';

let isTalking = false;

let SubtitleEditor = (props) => {
    const [videoSource, setVideoSource] = useState("");
    const [subs, setSubs] = useState([]);
    const [videoName, setVideoName] = useState("Video");
    const [currentSub, setCurrentSub] = useState(null);
    const [currentText, setCurrentText] = useState("");
    const [substitution, setSubstitution] = useState("");
    const [buttonsDisabled, setButtonsDisabled] = useState(false);

    const videoElement = React.createRef();

    const maleVoice = window.speechSynthesis.getVoices().find((element) => {
        return element.name === "Microsoft David Desktop - English (United States)";
    });

    const femaleVoice = window.speechSynthesis.getVoices().find((element) => {
        return element.name === "Microsoft Zira Desktop - English (United States)";
    });

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
        videoElement.current.currentTime = seconds;
    }

    let updateSubtitle = (e) => {
        let index = 0;
        for (let subtitle of subs) {
            if (e.target.currentTime > subtitle.startTime && e.target.currentTime < subtitle.endTime) {
                if (subtitle.text === "[male_dub]" || subtitle.text === "[female_dub]") {
                    videoElement.current.volume = 0.0;
                } else {
                    videoElement.current.volume = 1.0;
                }

                if (!currentText || index !== currentSub) {
                    if (isTalking) {
                        console.log("PAUSE");
                        videoElement.current.pause();
                        return;
                    }

                    if (subtitle.text === "[male_dub]" || subtitle.text === "[female_dub]") {
                        videoElement.current.volume = 0.0;

                        let voice = null;
                        isTalking = true;

                        console.log(subtitle.text);

                        if (subtitle.text === "[male_dub]") {
                            console.log("MAN VOICE");
                            voice = maleVoice;
                        } else {
                            console.log("WOMAN VOICE");
                            voice = femaleVoice;
                        }

                        let msg = new SpeechSynthesisUtterance();
                        msg.voice = voice;
                        msg.text = substitution;
                        msg.onend = () => {
                            console.log("STOPPING TTS");
                            isTalking = false;
                            let ve = document.getElementById("videoElement");
                            ve.volume = 1.0;
                            ve.play();
                        }
                        window.speechSynthesis.speak(msg);
                        setCurrentText(substitution);
                    } else {
                        setCurrentText(subtitle.text);
                    }

                    setCurrentSub(index);
                }
                return;
            }
            index++;
        }

        setCurrentText("");
    }

    let upload = async () => {
        try {
            setButtonsDisabled(true);
            await axios.post("https://deusprogrammer.com/api/dubs/videos", {
                name: videoName,
                subtitles: subs,
                videoPayload: videoSource.substring(videoSource.indexOf(',') + 1)
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
        <div className="App">
            <ToastContainer />
            <h3>Twitch Editor</h3>
            { videoSource ?
                <div>
                    <div style={{display: "table", margin: "auto"}}>
                        <div style={{display: "table-cell", verticalAlign: "middle"}}>
                            <h3>Video</h3>
                            <video id="videoElement" ref={videoElement} width="300px" src={videoSource} controls onTimeUpdate={updateSubtitle} />
                            <div style={{height: "50px", width: "300px"}}>{currentText}</div>
                            <label>Substitution</label><input type="text" onChange={(e) => {setSubstitution(e.target.value)}} />
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
                                                    <button type="button" onClick={() => {setStart(videoElement.current.currentTime)}}>Set Start</button>
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
                                                    <button type="button" onClick={() => {setEnd(videoElement.current.currentTime)}}>Set End</button>
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
                                                <input type="text" value={subs[currentSub].text} onChange={(e) => {setText(e.target.value)}} />
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
                                        subs.map((sub, index) => {
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
                                <button type="button" onClick={() => {newSub(videoElement.current.currentTime)}}>New Subtitle</button>
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
