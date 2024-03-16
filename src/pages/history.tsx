import EmotionsChart from "@/app/components/audio/emotionsChart";
import { useSkContext } from "@/app/context/secretKeyContext";
import DiaryService, { DiaryEntry } from "@/app/services/DiaryService";
import { use, useEffect, useState } from "react";

export type DiaryEntryWithClass = DiaryEntry & { modelClass: number, userClass: number, audioUrl?: string |null }


function History() {

  const [data, setData] = useState<DiaryEntry[]>([])
  const { keyPair } = useSkContext()

  useEffect(() => {

    const fetchData = async () => {
      const data = await DiaryService.getUserEntriesWithClass(keyPair.npub)
      console.log("data in history: ", data)
      setData(data)
    }
    fetchData()
  }, [keyPair])



  return (
    <div>
      <h1>History</h1>
      <div className=" w-[50rem] h-[35rem] debug">
        <EmotionsChart data={data} />
      </div>
    </div>
  );
}


export default History;