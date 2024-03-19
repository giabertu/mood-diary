import { DiaryEntryWithClass } from '@/pages/history'
import { EmotionClasses, Failed, supabase } from '../globals'

export type ProcessedDiaryEntryResponse = {
  message: string,
  modelPredictedEmotion: string,
  userPredictedEmotion?: string
  filePath: string,
  transcript: string
  llmRes: string //JSON string, type: {textEmotion: string, hybridEmotion: string}
}

export type DiaryEntry = {
  user: string,
  filePath: string,
  transcript: string,
  modelPredictedEmotion: string,
  userPredictedEmotion?: string
  textEmotion: string,
  hybridEmotion: string
}



class DiaryService {

  constructor() { }

  static async uploadDiaryEntry(audio: Blob, npub: string): Promise<{ status: string, message: string, filePath?: string }> {

    const file = new File([audio], "diary-entry.webm", { type: "audio/webm;codecs=pcm" })
    const filePath = `${npub}/${Date.now()}*${new Date().toLocaleDateString().replace(/\//g, '_')}.webm`;

    const { data, error } = await supabase
      .storage
      .from('audio-files')
      .upload(filePath, file, {
        contentType: file.type,
      })
    if (error) {
      console.error(error);
      return { status: 'error', message: 'Failed to upload file.' };
    } else {
      console.log(data)
      return { status: 'success', message: 'File uploaded successfully.', filePath };
    }
  }




  static async processDiaryEntry(filePath: string): Promise<ProcessedDiaryEntryResponse | Failed> {

    const response = await fetch('http://127.0.0.1:5000/process_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath }),
    });

    return response.json();
  }

  static async saveDiaryEntry(processedEntry: ProcessedDiaryEntryResponse, npub: string) {
    const { filePath, transcript, modelPredictedEmotion, llmRes } = processedEntry;
    const { textEmotion, hybridEmotion } = JSON.parse(llmRes)
    const { data, error } = await supabase
      .from('AudioFiles')
      .insert([
        {
          user: npub,
          filePath,
          transcript,
          modelPredictedEmotion,
          textEmotion,
          hybridEmotion,
        }
      ])
    if (error) {
      console.error(error);
      return { status: 'error', message: 'Failed to save diary entry.' };
    } else {
      console.log(data)
      return { status: 'success', message: 'Diary entry saved successfully.' };
    }
  }

  static async addUserFeedback(userPredictedEmotion: string, filePath: string) {
    const { data, error } = await supabase
      .from('AudioFiles')
      .update({ userPredictedEmotion })
      .eq('filePath', filePath)
    if (error) {
      console.error(error);
      return { status: 'error', message: 'Failed to add user feedback.' };
    } else {
      console.log(data)
      return { status: 'success', message: 'User feedback added successfully.' };
    }
  }

  static async getUserEntriesWithClass(npub: string): Promise<DiaryEntryWithClass[]> {

    console.log("npub in getEntryByUser: ", npub)
    const { data: diaryEntry, error } = await supabase
      .from('AudioFiles')
      .select('*')
      .eq('user', npub) as { data: DiaryEntry[], error: any }
    if (error) {
      console.error(error);
      return [];
    } else {
      const filePaths = diaryEntry.map(entry => entry.filePath)

      const { data: audioUrls, error } = await supabase
        .storage
        .from('audio-files')
        .createSignedUrls(filePaths, 60 * 60 * 24)

      const dataWithClass = diaryEntry.map((entry, i) => {
        let url = null
        if (!error) {
          url = audioUrls[i].signedUrl
        }

        //turns the emotion strings into their corresponding class numbers
        const modelClass = EmotionClasses[entry.modelPredictedEmotion as keyof typeof EmotionClasses]
        const textEmotionClass = EmotionClasses[entry.textEmotion as keyof typeof EmotionClasses]
        const hybridEmotionClass = EmotionClasses[entry.hybridEmotion as keyof typeof EmotionClasses]
        //if the user has not given feedback, the userClass is the same as the hybridEmotionClass (happy with the model's prediction)
        const userClass = entry.userPredictedEmotion ? EmotionClasses[entry.userPredictedEmotion as keyof typeof EmotionClasses] : hybridEmotionClass

        return { ...entry, textEmotionClass, hybridEmotionClass, modelClass, userClass, audioUrl: url }
      })

      console.log("dataWithClass in getEntryByUser: ", dataWithClass)
      return dataWithClass;
    }

  }


}

export default DiaryService;