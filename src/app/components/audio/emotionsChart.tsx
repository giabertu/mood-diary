import React, { PureComponent, useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { DiaryEntry } from '@/app/services/DiaryService';
import { DiaryEntryWithClass } from '@/pages/history';

interface EmotionsChartProps {
  data: DiaryEntry[] | null
}

enum Emotions {
  Angry = 'Angry',
  Disgusted = 'Disgusted',
  Fearful = 'Fearful',
  Happy = 'Happy',
  Neutral = 'Neutral',
  Sad = 'Sad'
}

interface CustomTooltipProps {
  active: boolean
  payload: any
  label: Emotions
}

function EmotionsChart({ data }: EmotionsChartProps) {


 
  if (!data) {
    return <p>Loading...</p>
  }

  if (data.length === 0) {
    return <p>No data to display</p>
  }


  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {

    console.log(active, payload, label)
    if (active && payload && payload.length) {

      const entry = payload[0].payload as DiaryEntryWithClass
      const transcript = entry.transcript

      const audioRef = useRef<HTMLAudioElement>(null);

      useEffect(() => {
        const handleKeyPress = (e: any) => {
          e.preventDefault()
          if (e.key === 'a') {
            if (audioRef.current) {
              audioRef.current.play().catch(error => console.log("Audio play error:", error));
            }
          }
          if (e.key === 's'){
            if (audioRef.current) {
            audioRef.current.pause()
            }
          }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => {
          window.removeEventListener('keypress', handleKeyPress);
        };
      }, []);
    

      return (
        <div className="custom-tooltip bg-white p-2">
          <div className="flex items-center gap-2">
            <p className='text-gray-500'> Predicted Emotion</p>
            <p className='font-bold'>{entry.hybridEmotion}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className='text-gray-500'>User Emotion</p>
            <p className='font-bold'>{entry.userPredictedEmotion}</p>
          </div>
          {entry.audioUrl && <audio ref={audioRef} src={entry.audioUrl} controls />}
          <p className="desc text-xs max-w-[20rem]">{transcript}</p>
        </div>
      );
    }

    return null;
  };


  return (
    <>
    <p>Press "a" when hovering on an entry to toggle play audio!</p>
    <p>Press "s" to stop the audio from playing </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="hybridEmotion" />
          <YAxis />
          {/* @ts-ignore */}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* @ts-ignore */}
          <Line type="monotone" dataKey="hybridEmotionClass" stroke="#8884d8" s />
          <Line type="monotone" dataKey="userClass" stroke="#228B22" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export default EmotionsChart;