import React, { PureComponent, useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot } from 'recharts';
import { DiaryEntryWithClass } from '@/pages/history';
import { NewspaperIcon } from '@heroicons/react/24/outline';


interface EmotionsChartProps {
  data: DiaryEntryWithClass[] | null,
  isLoading: boolean
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

function EmotionsChart({ data, isLoading }: EmotionsChartProps) {



  if (isLoading) {
    return (
      <div className='flex flex-col gap-8 h-full w-full py-10'>
        <div className='flex gap-20 flex-col text-gray-700 p-4 items-center h-full w-full'>
          <img src='/gridLoader.svg' className='w-32' />
        </div>
      </div>
    )
  }

  if ((data && data.length === 0)) {
    return (
      <div className='flex flex-col gap-8 h-full w-full py-10'>
        <div className='flex gap-20 flex-col text-gray-700 p-4 items-center h-full w-full'>
          <p className='text-3xl font-bold text-center'>Your diary is empty. Go to the record page and save your first entry!</p>
        </div>
      </div>
    )
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
          if (e.key === 's') {
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
        <div className=" p-4 text-gray-700 flex flex-col gap-4 rounded-md
        backdrop-filter backdrop-blur-md bg-white bg-opacity-80 
        ">
          <div className="flex items-center gap-2">
            <p className='text-gray-500'> Predicted Emotion:</p>
            <p
              style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }}
              className='font-bold bg-clip-text text-transparent'>{entry.hybridEmotion}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className='text-gray-500'>User Emotion:</p>
            <p
              style={{ backgroundImage: "linear-gradient(to right, #f83600 0%, #f9d423 100%)" }}
              className='font-bold bg-clip-text text-transparent'>{entry.userPredictedEmotion || "N/A"}</p>
          </div>
          {entry.audioUrl && <audio ref={audioRef} src={entry.audioUrl} controls />}
          <div>
            <p className='text-gray-500 flex items-center gap-1'><NewspaperIcon className='w-6' />Transcript:</p>
            <p className="font-medium max-w-[23rem]">{transcript}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (data) {
    return (
      <>
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
            <XAxis dataKey="created_at" />
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
}

export default EmotionsChart;