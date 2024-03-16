import { useSkContext } from '@/app/context/secretKeyContext';
import { hasFailed } from '@/app/globals';
import DiaryService, { DiaryEntry, ProcessedDiaryEntryResponse } from '@/app/services/DiaryService';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/app/globals';

const Emotions = [
  'Angry',
  'Disgusted',
  'Fearful',
  'Happy',
  'Neutral',
  'Sad',
]


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audio, setAudio] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [err, setErr] = useState('' as string | null);
  // const [predictedEmotion, setPredictedEmotion] = useState('' as string | null);
  const [diaryEntry, setDiaryEntry] = useState<DiaryEntry | null>(null);
  const [userPredictedEmotion, setUserPredictedEmotion] = useState('' as string | null);
  const [success, setSuccess] = useState('' as string | null);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  // const [recordedEntry, setRecordedEntry] = useState('' as string | null);

  const { keyPair, setKeyPair } = useSkContext();


  const chunks = useRef([] as Blob[])

  // useEffect(() => {

  //   const checkIfRecorded = async () => {
  //     //check if the user has already recorded an entry for today
  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);
  //     const { data, error } = await supabase
  //       .from('AudioFiles')
  //       .select('*')
  //       .gte('created_at', today.toISOString())
  //     console.log('data ', data)
  //     console.log('error ', error)
  //     let typedData = data as DiaryEntry[] | null;
  //     if (typedData && typedData.length > 0) {
  //       setDiaryEntry(typedData[0]);
  //       setHasRecorded(true);
  //       const { data: audioUrl, error } = await supabase
  //         .storage
  //         .from('audio-files')
  //         .createSignedUrl(typedData[0].filePath, 60 * 60)
  //       console.log("audioUrl ", audioUrl, error)
  //       if (audioUrl) {
  //         setAudio(audioUrl.signedUrl)
  //       }
  //     }
  //   }
  //   checkIfRecorded();
  // }, [])


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
      const res = await DiaryService.uploadDiaryEntry(blob, keyPair.npub);
      console.log('res ', res);
      if (res.filePath) {
        const processedResponse = await DiaryService.processDiaryEntry(res.filePath);
        console.log('processedEntry', processedResponse);
        if (hasFailed(processedResponse)) {
          console.error(processedResponse);
          setErr(processedResponse.message);
        } else {
          setDiaryEntry({ user: keyPair.npub, filePath: processedResponse.filePath, transcript: processedResponse.transcript, modelPredictedEmotion: processedResponse.modelPredictedEmotion });
          const savedRes = await DiaryService.saveDiaryEntry(processedResponse, keyPair.npub);
          console.log('savedRes ', savedRes);
        }
      }

    }
  }

  const addFeedback = async (emotion: string) => {
    const res = await DiaryService.addUserFeedback(emotion, diaryEntry!.filePath);
    setUserPredictedEmotion(emotion);
    setSuccess('Thank you for your feedback!')
    setTimeout(() => {
      setOpenFeedback(false);
      setSuccess('');
    }, 3000);
  }


  return (
    <>
      <div className='flex flex-col gap-4'>
        {
          !hasRecorded ?
            <div className='flex gap-4 '>
              {!isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
                onClick={startRecording}><MicrophoneIcon className='w-10' /></button>}
              {isRecording && !audio && <button className="border border-gray-300 rounded-3xl p-4 flex items-center gap-4"
                onClick={stopRecording}><StopIcon className='w-10' /></button>}
              {audio && <audio src={audio} controls></audio>}
              {audio && <button onClick={() => setAudio('')}>Delete</button>}
              {audio && <button onClick={postAudio}>Save</button>}
              {err && <p className=' text-red-500'>{err}</p>}
            </div> :
            <div>
              <p>You have already recorded an entry for today.</p>
              <button onClick={() => setHasRecorded(false)}>Replace entry</button>
              {audio && <audio src={audio} controls></audio>}
            </div>
        }
        {diaryEntry &&
          <div>
            <p>Your predicted emotion of today is: {diaryEntry.modelPredictedEmotion}.</p>
            <div className='flex gap-2 '>
              <p>Not quite right?</p><button onClick={() => setOpenFeedback(true)}>Provide Feedback</button>
            </div>
            {openFeedback &&
              <div>
                <p>What was your emotion?</p>
                <div className='flex gap-2'>
                  {Emotions.filter((e) => e !== diaryEntry.modelPredictedEmotion).map((emotion) => <button key={emotion} onClick={() => addFeedback(emotion)}>{emotion}</button>)}
                </div>
                {success && <p className='text-green-500'>{success}</p>}
              </div>
            }
          </div>}
      </div>
    </>
  );
};

export default AudioRecorder;
