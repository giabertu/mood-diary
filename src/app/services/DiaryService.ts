import { supabase } from '../globals'

class DiaryService {

  constructor() { }

  static async postDiaryEntry(audio: Blob, npub: string): Promise<{ status: string, message: string, filePath?: string }> {

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




  static async processDiaryEntry(filePath: string) {

    const response = await fetch('http://127.0.0.1:5000/process_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath }),
    });

    return response.json();
  }
}

export default DiaryService;