import OT from "@opentok/client";

import { API_KEY, SESSION_ID, P_TOKEN, S_TOKEN } from "../config";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
let apiKey = API_KEY;
let sessionId = SESSION_ID;
let session, subscriber, panner;
let publisher = [];
const predefinedTargetLanguge = ['HIN', 'FRE', 'CHI', 'KOR'];

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(
  setChunk,
  recorderRef,
  isHost,
  SelectedLanguage,
  streams,
  setStreams
) {
  let token = isHost ? P_TOKEN : S_TOKEN;
  if (session && session.isConnected()) {
    session.disconnect();
  }

  if (!session) {
    session = OT.initSession(apiKey, sessionId);
  }

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
    }
  });

  if (isHost) {
    OT.getUserMedia({ audio: true })
      .then(function (stream) {
        recorderRef.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/wav",
          recorderType: StereoAudioRecorder,
          timeSlice: 1000,
          ondataavailable: function (data) {
            setChunk(data);
          },
        });
        recorderRef.current.startRecording();
      })
      .catch(function (error) {
        console.error("Error accessing microphone:", error);
      });
  }

  // Subscribing to stream
  session.on("streamCreated", function (event) {
    const subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };
    setStreams(prevStreams => [...prevStreams, event.stream]);
    if (SelectedLanguage === event.stream.name) {
      subscriber = session.subscribe(
        event.stream,
        "subscriber",
        subscriberOptions,
        handleError
      );
      console.log("subscriber", event);
    }
  });
  // Do some action on destroying the stream
  session.on("sessionDisconnected", function (event) {
    console.log("event in destroyed", event);
  });
}

export function stopStreaming() {
  if (session) {
    publisher.forEach(pub => {
      session.unpublish(pub);
    });
  }
}

// The following functions are used in functionality customization
export function toggleVideo(state) {
  publisher.forEach(pub => {
    pub.publishVideo(state);
  });
}
export function toggleAudio(state) {
  publisher.forEach(pub => {
    pub.publishAudio(state);
  });
}
export function toggleAudioSubscribtion(state) {
  subscriber.subscribeToAudio(state);
}
export function toggleVideoSubscribtion(state) {
  subscriber.subscribeToVideo(state);
}

export function togglePublisherDestroy(state) {
  publisher.forEach(pub => {
    pub.disconnect();
  });
}

export function reSubscribeStreams(streams, userTargetLanguage) {
  if(subscriber){
    session.unsubscribe(subscriber);
  }
  console.log("Session unsubscribed");

  for (let i = 0; i < streams.length; i++) {
    if(streams[i].name === userTargetLanguage){
      console.log("Session resubscribed with language", streams[i].name);
      subscriber = session.subscribe(
        streams[i],
        "subscriber",
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        handleError
      );
    }

  }
}

function getAudioBuffer(buffer, audioContext) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(buffer, resolve, reject);
  });
}

function createAudioStream(audioBuffer, audioContext) {
  const startTime = audioContext.currentTime;

  const player = audioContext.createBufferSource();
  player.buffer = audioBuffer;
  player.start(startTime);

  const destination = audioContext.createMediaStreamDestination();
  panner = audioContext.createStereoPanner();
  panner.pan.value = 0;
  panner.connect(destination);
  player.connect(panner);
  return {
    audioStream: destination.stream,
    stop() {
      player.disconnect();
      player.stop();
    },
  };
}

export function publish(translatedBuffer, websocketTargetLanguage, userTargetLanguage) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create audio stream from mp3 file and video stream from webcam
  Promise.all([
    translatedBuffer ? getAudioBuffer(translatedBuffer, audioContext) : null,
    OT.getUserMedia({ videoSource: null }),
  ])
    .then((results) => {
      const [audioBuffer] = results;
      const { audioStream, stop } = createAudioStream(
        audioBuffer,
        audioContext
      );

      for (let i = 0; i < predefinedTargetLanguge.length; i++) {
        if (!publisher[i]) {
          const publisherOptions = {
            insertMode: "append",
            width: "100%",
            height: "100%",
            // Pass in the generated audio track as our custom audioSource
            audioSource: audioStream ? audioStream.getAudioTracks()[0] : null,
            // Enable stereo audio
            enableStereo: true,
            // Increasing audio bitrate is recommended for stereo music
            audioBitrate: 128000,
            name: predefinedTargetLanguge[i],
          };

          publisher[i] = OT.initPublisher(
            "publisher",
            publisherOptions,
            // eslint-disable-next-line no-loop-func
            (error) => {
              if (error) {
                handleError(error);
              } else {
                // If the connection is successful, publish the publisher1 to the session
                session.publish(publisher[i], (error) => {
                  if (error) {
                    handleError(error);
                  }
                });
              }
            }
          );
        } else {
          console.log("Publishing the audio....");
          // If publisher1 is already initialized, update the audio source
          if (websocketTargetLanguage === predefinedTargetLanguge[i]) {
            publisher[i].publishAudio(false); // Stop publishing audio temporarily
            publisher[i].setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
            publisher[i].publishAudio(true); // Start publishing audio again
          }
        }
      }

      // publisher1.on("destroyed", () => {
      //   // When the publisher is destroyed we cleanup
      //   stop();
      //   audioContext.close();
      // });
      // publisher2.on("destroyed", () => {
      //   // When the publisher is destroyed we cleanup
      //   stop();
      //   audioContext.close();
      // });
    })
    .catch((error) => {
      audioContext.close();
      throw error;
    });
}
