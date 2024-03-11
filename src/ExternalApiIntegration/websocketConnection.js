// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from "react-use-websocket";
import { useCallback, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { AUTH_TOKEN } from "../config"
import FetchApiToken from './fetchApiToken'
import CreateTranslationResource from './createTranslationResource'
import { publish } from "./VideoApiIntegration";

export const WebsocketConnection = ({
  dataBlobUrl,
  resourceId,
  setTranslatedBuffer,
  isInterviewStarted,
}) => {
  // const resourceId = '41d4cbd8-c3fc-45f8-bc24-893e0cba363b';
  // const resourceId = CreateTranslationResource(SelectedLanguage);

  const SERVER_URL =
  `wss://external-api-staging.meetkudo.com/api/v1/translate?id=${resourceId}`;
  const API_TOKEN = AUTH_TOKEN;
  const [binaryData, setBinaryData] = useState("audio/wav;base64,");
  const [index, setIndex] = useState(0);
  // const token = FetchApiToken();
  // console.log("api", token);

  // const id = CreateTranslationResource(SelectedLanguage);
  // console.log("id", id);



  // converting the data to valid binary format
  function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ";base64,";
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  const { getWebSocket, sendMessage } = useWebSocket(SERVER_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (message) => {
      let data = JSON.parse(message.data);
      console.log("Translating your audio...");
      console.log("Websocket response", data);

      setBinaryData((prev) => prev + data.audioData);
      var data1 = "audio/wav;base64," + data.audioData;
      var bufferData = convertDataURIToBinary(data1);
      var audioBlob = new Blob([bufferData], { type: "audio/wav" });

      var reader = new FileReader();
      reader.onload = function (event) {
        var audioData = event.target.result;

        publish(audioData, data.targetLanguage);
      };
      reader.readAsArrayBuffer(audioBlob);
      setIndex((prevIndex) => prevIndex + 1); // Increment index by 1
      if(!isInterviewStarted){
        getWebSocket().close();
      }

    },
    onClose: (e) => {
      var binary = convertDataURIToBinary(binaryData);
      var blob = new Blob([binary], { type: "audio/wav" });
      // saveAs(blob, "audio-output.ogg");

      console.log("closed", e);
    },
    onError: (e) => console.error("Error in websocket", e),
    shouldReconnect: () => false,
    protocols: ["Authorization", API_TOKEN],
  });

  // converting audio blob to float32array and send to websocket
  const convertBlobToArray = useCallback(async () => {
    const arrayBuffer = await dataBlobUrl.arrayBuffer();

    const dataView = new DataView(arrayBuffer);
    const pcmData = new Float32Array(arrayBuffer.byteLength / 4);

    for (let i = 0; i < pcmData.length; i++) {
      pcmData[i] = dataView.getInt16(i * 4, true);
    }
    sendMessage(JSON.stringify(pcmData));
  }, [dataBlobUrl, sendMessage]);

  // render convertBlobToArray function for every chunk of data
  useEffect(() => {
    convertBlobToArray();
  }, [dataBlobUrl, convertBlobToArray]);
};
