import EmotionsChart from "@/app/components/audio/emotionsChart";
import { useSkContext } from "@/app/context/secretKeyContext";
import DiaryService, { DiaryEntry, DiaryEntryWithCreatedAt } from "@/app/services/DiaryService";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, BackwardIcon, ForwardIcon, MagnifyingGlassIcon, MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline";
import { use, useEffect, useState } from "react";

export type DiaryEntryWithClass = DiaryEntryWithCreatedAt & { modelClass: number, userClass: number, audioUrl?: string | null }


function History() {

  const [data, setData] = useState<DiaryEntry[]>([])
  const [currentIdx, setCurrentIdx] = useState<number>(5)
  const [isZoomedOut, setIsZoomedOut] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { keyPair } = useSkContext()

  useEffect(() => {

    const fetchData = async () => {
      const data = await DiaryService.getUserEntriesWithClass(keyPair.npub)
      console.log("data in history: ", data)
      setData(data)
      setIsLoading(false)
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
      <div className=" w-[40rem] h-[32rem] relative">
        {!(data && data.length == 0) &&
          <button
            className="flex items-center justify-center gap-2 text-blue-700 text-lg absolute top-[-30px] right-[-30px]"
            onClick={() => setIsZoomedOut(!isZoomedOut)}
          >{isZoomedOut ? <>
            Zoom In
            <ArrowsPointingInIcon className="w-6" />
          </>
            :
            <>
              Zoom Out
              <ArrowsPointingOutIcon className="w-6" />
            </>
            }</button>
        }
        <EmotionsChart isLoading={isLoading} data={isZoomedOut ? data : data.slice(-5 + currentIdx, currentIdx >= data.length ? data.length : currentIdx)} />
      </div>
      {!(data && data.length === 0) &&
        <div className="flex gap-8">
          <button
            onClick={onBackward}
            disabled={currentIdx === 5 || isZoomedOut}
            className='p-2 flex items-center gap-2 font-bold text-lg
          rounded-md transition-all ease-in
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent
          hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800
          disabled:hover:bg-transparent disabled:hover:text-current'
          ><BackwardIcon className="w-6" />Last 5 entries</button>

          <button
            onClick={onForward}
            disabled={currentIdx >= data.length || isZoomedOut}
            className='p-2 flex items-center gap-2 font-bold text-lg
          rounded-md transition-all ease-in
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent
          hover:bg-blue-500 hover:bg-opacity-40 hover:text-blue-800
          disabled:hover:bg-transparent disabled:hover:text-current'
          >Next 5 entries <ForwardIcon className="w-6" />
          </button>
        </div>
      }
    </div>
  );
}


export default History;