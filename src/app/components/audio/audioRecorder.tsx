import { useSkContext } from '@/app/context/secretKeyContext';
import { hasFailed } from '@/app/globals';
import DiaryService, { DiaryEntry, ProcessedDiaryEntryResponse } from '@/app/services/DiaryService';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/app/globals';
import AudioBars from '../audioBars';
import { DocumentCheckIcon, DocumentMinusIcon, MegaphoneIcon, NewspaperIcon } from '@heroicons/react/24/outline';

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

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
      setIsProcessing(true);
      const res = await DiaryService.uploadDiaryEntry(blob, keyPair.npub);
      console.log('res ', res);
      if (res.filePath) {
        const processedResponse = await DiaryService.processDiaryEntry(res.filePath);
        console.log('processedEntry', processedResponse);
        if (hasFailed(processedResponse)) {
          console.error(processedResponse);
          setErr(processedResponse.message);
        } else {
          const savedRes = await DiaryService.saveDiaryEntry(processedResponse, keyPair.npub);
          console.log('savedRes ', savedRes);
          if (savedRes.status === 'success') {
            const { textEmotion, hybridEmotion } = JSON.parse(processedResponse.llmRes);
            setDiaryEntry({ user: keyPair.npub, filePath: processedResponse.filePath, transcript: processedResponse.transcript, modelPredictedEmotion: processedResponse.modelPredictedEmotion, textEmotion, hybridEmotion });
          } else {
            setErr(savedRes.message);
          }

        }
      }
      setIsProcessing(false);
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


  const recordingCallback = isRecording ? stopRecording : startRecording

  if (isProcessing) {
    return (
      <div className='flex flex-col gap-8 h-full w-full py-10'>
        <div className='flex gap-20 flex-col text-gray-700 p-4 items-center debug h-full w-full'>
          <h2 className='text-3xl font-bold text-center'>Processing audio, this may take a while.</h2>
          <img src='/gridLoader.svg' className='w-32' />
        </div>
      </div>
    )
  }

  if (true) {
    return (
      <div className='flex flex-col gap-8 h-full w-full py-10'>
        <div className='flex gap-10 flex-col text-gray-700 p-4 items-center debug h-full w-full'>
          <div className='flex flex-col gap-8 items-center justify-center'>
            <h2 className='text-3xl font-bold text-center'>Your predicted emotion of today is:</h2>
            <p className="bg-clip-text text-transparent text-5xl font-bold text-center"
              style={{ backgroundImage: "linear-gradient(to right, #2874a6, #cc1f1a)" }}>
              Neutral{diaryEntry?.hybridEmotion}
            </p>
          </div>
          <div className='flex gap-2 items-center'>
            <audio src={audio} controls></audio>
            <button
              className='p-2 flex items-center gap-2 font-bold text-lg
              hover:rounded-md transition-all ease-in
              hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800'
              onClick={() => setShowTranscript(prev => !prev)}>
              <NewspaperIcon className='w-6' />
              View transcript</button>
          </div>
          {showTranscript &&
            <p className='text-lg font-semibold px-4'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas sed quidem eos provident saepe ab accusantium dolorum expedita illum odio veniam mollitia nobis modi, culpa distinctio magni laudantium, unde tempora?
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum est, asperiores dolores voluptates animi eum fugit totam, magnam temporibus maiores id. Rerum impedit reiciendis nulla quo laboriosam itaque, quae facilis.
              {diaryEntry?.transcript}</p>
          }
          <div className='p-4 flex gap-2 items-center '>
            <p className='text-lg font-bold text-center'>Not quite right?</p>
            <button onClick={() => setOpenFeedback(prev => !prev)}
              className='p-2 flex items-center gap-2 font-bold text-lg
            hover:rounded-md transition-all ease-in
            hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800'
            >
              <MegaphoneIcon className='w-6' />
              Provide Feedback</button>
          </div>
          {openFeedback &&
            <div className='flex flex-col gap-8 items-center'>
              <h3 className='text-3xl font-bold text-center items-center'>What was your emotion?</h3>
              <div className='flex gap-8'>
                {Emotions.filter((e) => e !== diaryEntry?.modelPredictedEmotion).
                  map((emotion) => <button
                    className='p-2 px-3 flex items-center gap-2 font-bold text-lg
                hover:rounded-md transition-all ease-in
                hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800'
                    key={emotion} onClick={() => addFeedback(emotion)}>{emotion}</button>)}
              </div>
              {success && <p className='text-green-500'>{success}</p>}
              <p className='text-lg font-semibold text-center px-4'>Our hybrid model approach allows us to estimate audio features and semantic information separately. Based on audio features, our model predicted the emotion to be
                <span className="bg-clip-text text-transparent font-bold"
                  style={{ backgroundImage: "linear-gradient(to right, #2874a6, #cc1f1a)" }}> Happy{diaryEntry?.modelPredictedEmotion}</span>.
                Based on semantic information, it predicted
                <span className="bg-clip-text text-transparent font-bold text-center"
                  style={{ backgroundImage: "linear-gradient(to right, #2874a6, #cc1f1a)" }}> Disgusted{diaryEntry?.textEmotion}</span>, giving us an hybrid and final emotion of
                <span className="bg-clip-text text-transparent font-bold text-center"
                  style={{ backgroundImage: "linear-gradient(to right, #2874a6, #cc1f1a)" }}> Sad
                  {diaryEntry?.hybridEmotion}</span>.</p>
            </div>
          }
        </div>
      </div >
    )
  }



  return (
    <>
      <div className='flex flex-col gap-8 h-full w-full'>
        {
          !hasRecorded && !isProcessing && !diaryEntry ?
            <div className='flex gap-8 flex-col text-gray-700 p-4 items-center debug h-full w-full '>
              <h2 className='text-4xl font-bold text-center'>Record a journal entry and find out your emotional state.</h2>
              {!audio && <button
                className="border border-gray-700 rounded-3xl p-4 flex items-center gap-4 font-bold text-lg
                hover:rounded-md transition-all ease-in "
                onClick={recordingCallback}>{isRecording ?
                  <><AudioBars colorClass='text-red-700' />Stop Recording</> :
                  <><MicrophoneIcon className='w-8' />Start Recording</>}</button>}
              {audio && <audio src={audio} controls></audio>}
              {audio && <button
                onClick={() => setAudio('')}
                className='border border-gray-700 rounded-3xl p-4 flex items-center gap-2 font-bold text-lg
              hover:rounded-md transition-all ease-in
              hover:bg-red-600 hover:bg-opacity-30 hover:text-red-900'
              ><DocumentMinusIcon className='w-6' />Delete Diary Entry</button>}
              {audio && <button
                onClick={postAudio}
                className='border border-gray-700 rounded-3xl p-4 px-5 flex items-center gap-2 font-bold text-lg
              hover:rounded-md transition-all ease-in
            hover:bg-green-500 hover:bg-opacity-40 hover:text-green-800'
              ><DocumentCheckIcon className='w-6' />Save Diary Entry</button>}
              {err && <p className=' text-red-500'>{err}</p>}
              <img src='/check.svg' className=' w-32' />
            </div> :
            <div>
              <p>You have already recorded an entry for today.</p>
              <button onClick={() => setHasRecorded(false)}>Replace entry</button>
              {audio && <audio src={audio} controls></audio>}
            </div>
        }
      </div>
    </>
  );
};

export default AudioRecorder;
