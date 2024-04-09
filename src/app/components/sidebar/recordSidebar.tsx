import { supabase } from "@/app/globals";
import { DiaryEntry, DiaryEntryWithCreatedAt } from "@/app/services/DiaryService";
import { useEffect, useState } from "react";





function RecordSidebar() {

  const [hasRecorded, setHasRecorded] = useState(false);
  const [diaryEntry, setDiaryEntry] = useState<DiaryEntryWithCreatedAt | null>(null);
  const [pastWeekEntries, setPastWeekEntries] = useState<DiaryEntryWithCreatedAt[] | null>(null); //entries from the past week [0] is the most recent [6] is the oldest
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkIfRecorded = async () => {
      //check if the user has already recorded an entry for today
      const now = new Date().getTime();
      const yesterday = new Date(now - 86400000);
      const aWeekAgo = new Date(now - 604800000);
      yesterday.setHours(0, 0, 0, 0);
      aWeekAgo.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('AudioFiles')
        .select('*')
        .gte('created_at', aWeekAgo.toISOString())
      console.log('data ', data)
      console.log('error ', error)
      let typedData = data as DiaryEntryWithCreatedAt[] | null;
      console.log('typedData in sidebar ', typedData)
      if (typedData && typedData.length > 0) {
        setPastWeekEntries(typedData);
        typedData.forEach(entry => {
          const entryDate = new Date(entry.created_at);
          entryDate.setHours(0, 0, 0, 0);
          if (entryDate.toISOString() === yesterday.toISOString()) {
            setDiaryEntry(entry);
            setHasRecorded(true);
          }
        })
        setLoading(false);
      }
    }
    checkIfRecorded();
  }, [])

  if (loading) {

    return (
      <div className='w-1/4 border border-gray-300 border-l-0 p-2'>
        <div className="sticky top-20 z-10">
          <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
            <img src="/loading.svg" alt="" />
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className='w-1/4 border border-gray-300 border-l-0 p-2'>
      <div className="sticky top-20 z-10">
        <div className="flex flex-col gap-4 p-4 text-center text-gray-700">
          {diaryEntry ?
            <p
              className='text-lg font-semibold p-2 px-4
            backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'>
              Yesterday's predicted emotion is <span style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }} className='bg-clip-text text-transparent'>{diaryEntry.hybridEmotion}</span>
            </p>
            :
            <p
              className='text-lg font-semibold p-2 flex gap-2 items-center justify-center
            backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'>
              You have not recorded any entry yesterday
            </p>
          }
          <p
            className='text-lg font-semibold p-2 px-4 
            backdrop-filter backdrop-blur-md bg-white bg-opacity-30 rounded-md'>
            You have recorded <span style={{ backgroundImage: "linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)" }} className='bg-clip-text text-transparent'>{pastWeekEntries?.length}</span> entries in the past week</p>
        </div>
      </div>
    </div>
  )


}

export default RecordSidebar;