import EmotionsChart from "@/app/components/audio/emotionsChart";
import { useSkContext } from "@/app/context/secretKeyContext";
import DiaryService, { DiaryEntry } from "@/app/services/DiaryService";
import { BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";
import { use, useEffect, useState } from "react";

export type DiaryEntryWithClass = DiaryEntry & { modelClass: number, userClass: number, audioUrl?: string | null }


function History() {

  const [data, setData] = useState<DiaryEntry[]>([])
  const [currentIdx, setCurrentIdx] = useState<number>(5)
  const { keyPair } = useSkContext()

  useEffect(() => {

    const fetchData = async () => {
      const data = await DiaryService.getUserEntriesWithClass(keyPair.npub)
      console.log("data in history: ", data)
      setData(data)
    }
    fetchData()
  }, [keyPair])


  const onBackward = () => {
    if (currentIdx == 5) return
    setCurrentIdx(currentIdx - 5)
  }

  const onForward = () => {
    if (Math.abs(currentIdx) >= data.length) return
    setCurrentIdx(currentIdx + 5)
  }

  let startIdx = -5 + currentIdx
  let endIdx = currentIdx
  console.log("startIdx: ", startIdx, "endIdx: ", endIdx)

  return (
    <div className="flex flex-col gap-10 p-4 items-center text-gray-700">
      <h1 className="text-3xl font-bold">History</h1>
      <div className=" w-[50rem] h-[35rem] debug">
        <EmotionsChart data={data.slice(-5 + currentIdx, currentIdx >= data.length ? data.length : currentIdx)} />
      </div>
      <div className="flex gap-8">
        <button
          onClick={onBackward}
          disabled={currentIdx === 5}
          className='p-2 flex items-center gap-2 font-bold text-lg
          rounded-md transition-all ease-in
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent
          hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800
          disabled:hover:bg-transparent disabled:hover:text-current'
        ><BackwardIcon className="w-6" />Last 5 entries</button>

        <button
          onClick={onForward}
          disabled={currentIdx >= data.length}
          className='p-2 flex items-center gap-2 font-bold text-lg
          rounded-md transition-all ease-in
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent
          hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800
          disabled:hover:bg-transparent disabled:hover:text-current'
        >Next 5 entries <ForwardIcon className="w-6" /></button>

      </div>
      <div className="self-start">
        <p className="text-lg font-semibold px-4">Press "a" when hovering on an entry to toggle play audio</p>
        <p className='text-lg font-semibold px-4'>Press "s" to stop the audio from playing </p>
      </div>
    </div>
  );
}


export default History;