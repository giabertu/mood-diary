import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audio, setAudio] = useState('');


  const chunks = useRef([] as Blob[])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

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
      const blob = new Blob(chunks.current, { type: "audio/wav; codecs=opus" });
      console.log("here is the blob ", blob)

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

  return (
    <div className='flex gap-4 '>
      {!isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
        onClick={startRecording}><MicrophoneIcon className='w-10' /></button>}
      {isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
        onClick={stopRecording}><StopIcon className='w-10' /></button>}
      {audio && <audio src={audio} controls></audio>}
      {audio && <button onClick={() => setAudio('')}>Delete</button>}
    </div>
  );
};

export default AudioRecorder;
