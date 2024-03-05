import React, { useState, useEffect, useRef } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Tooltip, Button } from "@mui/material";
import logo from "./Group.png";
import {
  toggleAudio,
  toggleVideo,
  toggleAudioSubscribtion,
  toggleVideoSubscribtion,
  initializeSession,
  stopStreaming,
  publish,
} from "./ExternalApiIntegration/VideoApiIntegration";
import { WebsocketConnection } from "./ExternalApiIntegration/websocketConnection";
import { LanguageSelector } from "./LanguageSelector/LanguageSelector";
import { useLocation } from "react-router-dom";
import "./VideoChatComponent.scss";

function VideoComponent() {
  const location = useLocation();
  const isHost = location.state.role;
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioSubscribed, setIsAudioSubscribed] = useState(true);
  const [isVideoSubscribed, setIsVideoSubscribed] = useState(true);
  const [isStreamSubscribed, setIsStreamSubscribed] = useState(false);
  const [translatedBuffer, setTranslatedBuffer] = useState(null);
  const [chunk, setChunk] = useState(null);
  const [SelectedLanguage, setSelectedLanguage] = useState("ENGLISH");
  const [index, setIndex] = useState(0);
  const recorderRef = useRef(null);

  useEffect(() => {
    if (isInterviewStarted) {
      initializeSession(setChunk, recorderRef, isHost);
    } else {
      stopStreaming();

      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
    }
  }, [isInterviewStarted]);

  useEffect(() =>{
    if(translatedBuffer){
      publish(translatedBuffer[index])
      setIndex((prevIndex) => prevIndex + 1);
      console.log("after use effect", index, translatedBuffer);

    }
  }, [translatedBuffer])

  const onToggleAudio = (action) => {
    setIsAudioEnabled(action);
    toggleAudio(action);
  };
  const onToggleVideo = (action) => {
    setIsVideoEnabled(action);
    toggleVideo(action);
  };
  const onToggleAudioSubscribtion = (action) => {
    setIsAudioSubscribed(action);
    toggleAudioSubscribtion(action);
  };
  const onToggleVideoSubscribtion = (action) => {
    setIsVideoSubscribed(action);
    toggleVideoSubscribtion(action);
  };

  const renderToolbar = () => {
    return (
      <>
        {isInterviewStarted && (
          <div className="video-toolbar">
            <LanguageSelector setValue={setSelectedLanguage} />
            <div className="video-tools">
              {isAudioEnabled ? (
                <Tooltip title="mic on">
                  <MicIcon
                    onClick={() => onToggleAudio(false)}
                    className="on-icon"
                  />
                </Tooltip>
              ) : (
                <Tooltip title="mic off">
                  <MicOffIcon
                    onClick={() => onToggleAudio(true)}
                    className="off-icon"
                  />
                </Tooltip>
              )}
              {isVideoEnabled ? (
                <Tooltip title="camera on">
                  <VideocamIcon
                    onClick={() => onToggleVideo(false)}
                    className="on-icon"
                  />
                </Tooltip>
              ) : (
                <Tooltip title="camera off">
                  <VideocamOffIcon
                    onClick={() => onToggleVideo(true)}
                    className="off-icon"
                  />
                </Tooltip>
              )}

              {isStreamSubscribed && (
                <>
                  {isAudioSubscribed ? (
                    <Tooltip title="sound on">
                      <VolumeUpIcon
                        onClick={() => onToggleAudioSubscribtion(false)}
                        className="on-icon"
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="sound off">
                      <VolumeOffIcon
                        onClick={() => onToggleAudioSubscribtion(true)}
                        className="off-icon"
                      />
                    </Tooltip>
                  )}
                  {isVideoSubscribed ? (
                    <Tooltip title="screen on">
                      <VisibilityIcon
                        onClick={() => onToggleVideoSubscribtion(false)}
                        className="on-icon"
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="screen of">
                      <VisibilityOffIcon
                        onClick={() => onToggleVideoSubscribtion(true)}
                        className="off-icon"
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <div className="actions-btns">
        { isHost ? (
          <Button
          onClick={() => publish(translatedBuffer)}
          color="primary"
          variant="contained"
        >
          Start Publishing
        </Button>
        ) : null}
        <Button
          onClick={() => setIsInterviewStarted(true)}
          disabled={isInterviewStarted}
          color="primary"
          variant="contained"
        >
          Start chat
        </Button>
          <Button
          onClick={() => setIsInterviewStarted(false)}
          disabled={!isInterviewStarted}
          color="secondary"
          variant="contained"
        >
          Finish chat
        </Button>
      </div>
      <div className="video-container">
        <div
          id="subscriber"
          className={`${
            isStreamSubscribed ? "main-video" : "additional-video"
          }`}
        >
          {isStreamSubscribed && renderToolbar()}
        </div>
        <div
          id="publisher"
          className={`${
            isStreamSubscribed ? "additional-video" : "main-video"
          }`}
        >
          {!isStreamSubscribed && renderToolbar()}
        </div>
      </div>

      {chunk ? (
        <WebsocketConnection
          dataBlobUrl={chunk}
          translatedBuffer={translatedBuffer}
          setTranslatedBuffer={setTranslatedBuffer}
          isInterviewStarted={isInterviewStarted}
          SelectedLanguage={SelectedLanguage}
        />
      ) : null}
    </>
  );
}

export default VideoComponent;
