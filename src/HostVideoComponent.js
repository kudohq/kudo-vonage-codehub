import React, { useState, useEffect, useRef } from "react";
import logo from "./Group.png";
import {
  initializeSession,
  reSubscribeStreams
} from "./ExternalApiIntegration/VideoApiIntegration";
import { LanguageSelector } from "./LanguageSelector/LanguageSelector";
import { useLocation } from "react-router-dom";
import "./VideoChatComponent.scss";

function HostVideoComponent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('sessionId');
  const subToken = searchParams.get('SubToken');
  const [SelectedLanguage, setSelectedLanguage] = useState({value: 'HIN', label: 'HINDI'});
  const [streams, setStreams] = useState([]);
  const [chunk, setChunk] = useState(null);
  const [opentokApiToken, setOpentokApiToken] = useState({ session_id: sessionId, subscriber_token: subToken });
  const languageRef = useRef(false);
  const recorderRef = useRef(null);
  const isHost = false;
  useEffect(() => {
      initializeSession(opentokApiToken, setChunk, recorderRef, isHost, SelectedLanguage.value,streams, setStreams);

  }, []);

  useEffect(() => {
    if(languageRef.current){
      reSubscribeStreams(streams, SelectedLanguage.value);
    }else {
      languageRef.current  = true;
    }
  }, [SelectedLanguage]);



  return (
    <>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <div className="actions-btns">
        <div className="joinLink">
            <p className="mt-3">Hindi is the default language. Adjust language here: </p>
            <LanguageSelector setSelectedLanguage={setSelectedLanguage} />
        </div>
      </div>
      <div className="video-container">
          <>
          <div
            id="subscriber"
            className="main-video"
          >
          </div>
        </>
      </div>
    </>
  );
}

export default HostVideoComponent;
