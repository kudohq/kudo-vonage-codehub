// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from "react-use-websocket";
import { useCallback, useEffect, useState } from "react";
import { saveAs } from "file-saver";

export const WebsocketConnection = ({ dataBlobUrl }) => {
  const SERVER_URL =
    "wss://external-api-staging.meetkudo.com/api/v1/translate?id=d5c3c200-ce99-4f4c-8f39-abdbf523d8ad";
  const API_TOKEN =
    "eyJraWQiOiIwSGkrOHhFbTV3NlwvN21NdmdkXC9YQThHYzdmSitwMUpYQTM3SjdCOVhiRkU9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3dTAwNmh1bWZxMXY4c2VuNmdiMGZmNXZtaiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoic2hhcmVkLXNlcnZpY2VzXC9zZXJ2aWNlIiwiYXV0aF90aW1lIjoxNzA3ODQ2Mjc5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9lUFNxNjlpQ3kiLCJleHAiOjE3MDc5MzI2NzksImlhdCI6MTcwNzg0NjI3OSwidmVyc2lvbiI6MiwianRpIjoiYjgwNTA0MzMtZjhjNy00MWM4LTk3M2UtZTMzOTkwYjc3YjAwIiwiY2xpZW50X2lkIjoiN3UwMDZodW1mcTF2OHNlbjZnYjBmZjV2bWoifQ.eXpgAKzmF89etKQbH1-whnHNFUuHrcQDSQTdTDyQuQ8XRqKegPLbjAkgsLpq3X63RMUR7ev6LaMp1NW39FNBwSUgNOZAdbYvFzwa0DinXg65Dsflh6m9Dr8pEBzaFne0mHApLNf6tTZmyTTZcpu5P7Nh9aFMSnuulhD36uG7swRfPQ_6nclivq8AkN3edbUGkkmPcgpkU0YVdaNlC1knXI2BirPFHisz4p20EID4bIFH4nIHB1dJGpg8mtY9YHWM8Sdb49LdVnVIFZEqSaGYM_B7gSr8l5WfNHqzvR-Sy2aCDn53gtlA9x-Zc9UEO22A4UC0TZ4vLAwOFjZbn2TIhA";

  const [binaryData, setBinaryData] = useState("audio/wav;base64,");

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

  const { sendMessage } = useWebSocket(SERVER_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    onMessage: (message) => {
      let data = JSON.parse(message.data);
      console.log("Translating your audio...");
      console.log("Websocket response", data);

      setBinaryData((prev) => prev + data.audioData);
    },
    onClose: (e) => {
      var binary = convertDataURIToBinary(binaryData);
      var blob = new Blob([binary], { type: "audio/wav" });

      saveAs(blob, "audio-output.ogg");

      console.log("closed", e);
    },
    onError: (e) => console.error("Error in websocket", e),
    share: true,
    shouldReconnect: () => false,
    protocols: ["Authorization", API_TOKEN],
  });

  // converting audio blob to float32array and send to websocket
  const convertBlobToArray = useCallback(async () => {
    const arrayBuffer = await dataBlobUrl.arrayBuffer();

    console.log("arrayBuffer", arrayBuffer, "dataBlobUrl", dataBlobUrl);

    const dataView = new DataView(arrayBuffer);
    const pcmData = new Float32Array(arrayBuffer.byteLength / 4);

    for (let i = 0; i < pcmData.length; i++) {
      pcmData[i] = dataView.getInt16(i * 4, true);
    }
    console.log("pcmData", pcmData);
    sendMessage(JSON.stringify(pcmData));
  }, [dataBlobUrl, sendMessage]);

  // render convertBlobToArray function for every chunk of data
  useEffect(() => {
    convertBlobToArray();
  }, [dataBlobUrl, convertBlobToArray]);
};
