import React, { useState, useEffect, useRef } from "react";
import MicIcon from "@mui/icons-material/Mic.js";
import MicOffIcon from "@mui/icons-material/MicOff.js";
import VideocamIcon from "@mui/icons-material/Videocam.js";
import VideocamOffIcon from "@mui/icons-material/VideocamOff.js";
import { Tooltip, Button } from "@mui/material";
import logo from "./Group.png";
import {
  toggleAudio,
  toggleVideo,
  togglePublisherDestroy,
  initializeSession,
  stopStreaming,
  publish,
  reSubscribeStreams,
} from "./ExternalApiIntegration/VideoApiIntegration.js";
import { WebsocketConnection } from "./ExternalApiIntegration/websocketConnection.jsx";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import createVonageApiTokens from "./ExternalApiIntegration/createVonageApiTokens.js";
import CreateTranslationResource from "./ExternalApiIntegration/createTranslationResource.js";
import { LanguageSelector } from "./LanguageSelector/LanguageSelector.js";
import "./VideoChatComponent.scss";
import "react-toastify/dist/ReactToastify.css";

export const MeetingComponent = () => {
  const location = useLocation();
  const isMeeting = location.pathname === "/meeting";
  const state = location.state.form;
  const UserSelectedLanguges = state.source;
  const UserSelectedLangugesValues = UserSelectedLanguges.map((x) => x.value);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isStreamSubscribed, setIsStreamSubscribed] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [translatedBuffer, setTranslatedBuffer] = useState(null);
  const [SelectedLanguage, setSelectedLanguage] = useState({
    value: "HIN",
    label: "HINDI",
  });
  const [streams, setStreams] = useState([]);
  const [chunk, setChunk] = useState(null);
  const [opentokApiToken, setOpentokApiToken] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const languageRef = useRef(false);
  const recorderRef = useRef(null);

  const isHost = true;
  useEffect(() => {
    if (isInterviewStarted) {
      initializeSession(
        opentokApiToken,
        setChunk,
        recorderRef,
        isHost,
        SelectedLanguage.value,
        streams,
        setStreams,
        setIsSessionConnected
      );
    } else {
      stopStreaming();

      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
    }
  }, [isInterviewStarted]);

  useEffect(() => {
    if (languageRef.current) {
      reSubscribeStreams(streams, SelectedLanguage.value);
    } else {
      languageRef.current = true;
    }
  }, [SelectedLanguage]);

  useEffect(() => {
    CreateTranslationResource(
      null,
      UserSelectedLangugesValues,
      state.gender,
      isMeeting
    )
      .then((id) => setResourceId(id))
      .catch((error) =>
        console.error("Error creating translation resource:", error)
      );

    createVonageApiTokens()
      .then((tokens) => setOpentokApiToken(tokens))
      .catch((error) =>
        console.error("Error creating translation resource:", error)
      );
  }, []);

  const onToggleAudio = (action) => {
    setIsAudioEnabled(action);
    toggleAudio(action);
  };
  const handleStartPublishing = () => {
    publish(translatedBuffer);
    setIsStreamSubscribed(true);
  };

  const onToggleVideo = (action) => {
    setIsVideoEnabled(action);
    toggleVideo(action);
  };

  const onTogglePublisherDestroy = (action) => {
    setIsInterviewStarted(action);
    togglePublisherDestroy();
  };

  const renderToolbar = () => {
    return (
      <>
        {isInterviewStarted && (
          <div className="video-toolbar">
            {isHost && isSessionConnected ? (
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
              </div>
            ) : null}
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <h4 className="AppHeading">Multilingual Webinar powered by KUDO AI</h4>
      <div className="joinLink">
          <p className="mt-3">
            Hindi is the default language. Adjust language here:{" "}
          </p>
          <LanguageSelector
            setSelectedLanguage={setSelectedLanguage}
            predefinedLanguages={UserSelectedLanguges}
          />
        </div>
      <div className="actions-btns">
        {isInterviewStarted && isSessionConnected ? (
          <Button
            onClick={handleStartPublishing}
            color="primary"
            variant="contained"
            disabled={isStreamSubscribed}
          >
            Start Publishing
          </Button>
        ) : null}
        {opentokApiToken ? (
          <>
            <Button
              onClick={() => setIsInterviewStarted(true)}
              disabled={isInterviewStarted}
              color="primary"
              variant="contained"
            >
              Start Meeting
            </Button>
            <Button
              onClick={() => onTogglePublisherDestroy(false)}
              disabled={!isInterviewStarted}
              color="secondary"
              variant="contained"
            >
              End Meeting
            </Button>
          </>
        ) : null}
      </div>
      <div className="video-container">
        <div id="publisher" className="main-video">
          {isStreamSubscribed && renderToolbar()}
        </div>
      </div>

      {chunk && resourceId ? (
        <WebsocketConnection
          dataBlobUrl={chunk}
          translatedBuffer={translatedBuffer}
          setTranslatedBuffer={setTranslatedBuffer}
          isInterviewStarted={isInterviewStarted}
          resourceId={resourceId}
          userTargetLanguage={SelectedLanguage.value}
          isMeeting
        />
      ) : null}
    </div>
  );
};
