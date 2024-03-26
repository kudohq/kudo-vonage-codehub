import { useState } from 'react';
import OT from '@opentok/client';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import { handleError } from '../Helpers/HandleError.js';
import { getAudioBuffer, createAudioStream, sendCaption } from '../VonageIntegration/publishData.js';

export const useVonagePublisher = (session) => {
  const [publishers, setPublishers] = useState({});

  const targetLanguages = predefinedLanguages.map((language) => language.value);

  const createPublisher = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create audio stream from mp3 file and video stream from webcam
    Promise.all([OT.getUserMedia({ videoSource: null })])
      .then(() => {
        const { audioStream } = createAudioStream(null, audioContext);
        const localPublishers = {};
        for (let i = 0; i < targetLanguages.length; i++) {
          const publisherOptions = {
            insertMode: 'append',
            width: '100%',
            height: '100%',
            // Pass in the generated audio track as our custom audioSource
            audioSource: audioStream.getAudioTracks()[0],
            // Enable stereo audio
            enableStereo: true,
            // Increasing audio bitrate is recommended for stereo music
            audioBitrate: 128000,
            name: targetLanguages[i],
          };

          let publisher = OT.initPublisher(
            'publisher',
            publisherOptions,
            // eslint-disable-next-line no-loop-func
            (error) => {
              if (error) {
                handleError(error);
              } else {
                // If the connection is successful, publish the publisher1 to the session
                session.publish(publisher, (error) => {
                  if (error) {
                    handleError(error);
                  }
                });
              }
            }
          );
          localPublishers[targetLanguages[i]] = publisher;
        }
        setPublishers(localPublishers);
      })
      .catch((error) => {
        audioContext.close();
        throw error;
      });
  };

  const publishTranslatedAudio = (translatedBuffer, websocketTargetLanguage, CaptionText) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Create audio stream from mp3 file and video stream from webcam
    Promise.all([
      translatedBuffer ? getAudioBuffer(translatedBuffer, audioContext) : null,
      OT.getUserMedia({ videoSource: null }),
    ])
      .then((results) => {
        const [audioBuffer] = results;
        const { audioStream } = createAudioStream(audioBuffer, audioContext);

        console.log('Publishing the audio....');
        // If publisher1 is already initialized, update the audio source
        publishers[websocketTargetLanguage].publishAudio(false); // Stop publishing audio temporarily
        publishers[websocketTargetLanguage].setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
        publishers[websocketTargetLanguage].publishAudio(true); // Start publishing audio again
        sendCaption(session, CaptionText, websocketTargetLanguage);
        publishers[websocketTargetLanguage].publishCaptions(true);
      })
      .catch((error) => {
        audioContext.close();
        throw error;
      });
  };

  // The following functions are used in functionality customization
  const toggleVideo = (state) => {
    Object.values(publishers).forEach((pub) => {
      pub.publishVideo(state);
    });
  };
  const toggleAudio = (state) => {
    Object.values(publishers).forEach((pub) => {
      pub.publishAudio(state);
    });
  };

  const togglePublisherDestroy = () => {
    Object.values(publishers).forEach((pub) => {
      pub.disconnect();
    });
  };

  const stopStreaming = () => {
    if (session) {
      Object.values(publishers).forEach((pub) => {
        session.unpublish(pub);
      });
    }
  };

  return {
    toggleVideo,
    toggleAudio,
    togglePublisherDestroy,
    stopStreaming,
    createPublisher,
    publishTranslatedAudio,
  };
};
