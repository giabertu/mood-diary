import { useSkContext } from '@/app/context/secretKeyContext';
import DiaryService from '@/app/services/DiaryService';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audio, setAudio] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);

  const { keyPair, setKeyPair } = useSkContext();


  const chunks = useRef([] as Blob[])


  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=pcm" });

    setMediaRecorder(recorder);
    recorder.start();
    console.log('recording started');
    setIsRecording(true);
  };

  if (mediaRecorder) {


    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      console.log('chunk data ', e.data);
      chunks.current.push(e.data)
    };

    mediaRecorder.onstop = () => {
      console.log("chunks ", chunks.current)
      const blob = new Blob(chunks.current, { 'type': mediaRecorder.mimeType });
      console.log("here is the blob ", blob)
      setBlob(blob);
      const audioURL = window.URL.createObjectURL(blob);
      console.log('audio url ', audioURL)
      setAudio(audioURL);
      chunks.current = []
    }
  }


  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log('recording stopped');
      setIsRecording(false);
    }
  };


  const postAudio = async () => {
    if (blob) {
      const res = await DiaryService.postDiaryEntry(blob, keyPair.npub);
      console.log('res ', res);
      if (res.filePath) {
        const pyRes = await DiaryService.processDiaryEntry(res.filePath);
        console.log('pyRes ', pyRes);
      }

    }
  }


  return (
    <div className='flex gap-4 '>
      {!isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
        onClick={startRecording}><MicrophoneIcon className='w-10' /></button>}
      {isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
        onClick={stopRecording}><StopIcon className='w-10' /></button>}
      {audio && <audio src={audio} controls></audio>}
      {audio && <button onClick={() => setAudio('')}>Delete</button>}
      {audio && <button onClick={postAudio}>Save</button>}
    </div>
  );
};

export default AudioRecorder;
