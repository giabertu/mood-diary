import { Failed, supabase } from '../globals'

export type ProcessedDiaryEntryResponse = {
  message: string,
  modelPredictedEmotion: string,
  userPredictedEmotion?: string
  filePath: string,
  transcript: string
}

export type DiaryEntry = {
  user: string,
  filePath: string,
  transcript: string,
  modelPredictedEmotion: string,
  userPredictedEmotion?: string
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
    const { filePath, transcript, modelPredictedEmotion} = processedEntry;
    const { data, error } = await supabase
      .from('AudioFiles')
      .insert([
        {
          user: npub,
          filePath,
          transcript,
          modelPredictedEmotion,
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
}

export default DiaryService;