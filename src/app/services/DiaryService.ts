import { supabase } from '../globals'

class DiaryService {

  constructor() { }

  // static async postDiaryEntry(audio: Blob, npub: string): Promise<{status: string, message: string, filePath?: string}> {
  //   console.log('audio ', audio);
  //   console.log('npub ', npub);

  //   const file = new File([audio], "diary-entry.wav", {type: "audio/wav"})
  //   const formData = new FormData();
  //   // formData.append('name', "diary-entry")
  //   // formData.append('audio', file);
  //   // formData.append('npub', npub);

  //   const response = await fetch('http://localhost:3001/diary-entry', {
  //     method: 'POST',
  //     body: formData
  //   });
  //   // const response = await fetch('http://localhost:3001/diary-entry', {
  //   //   method: 'POST',
  //   //   body: JSON.stringify({file, npub}),
  //   // });

  //   return response.json();
  // }

  //   static async postDiaryEntry(audio: Blob, npub: string): Promise<{status: string, message: string, filePath?: string}> {
  //     console.log('audio ', audio);
  //     console.log('npub ', npub);

  //     // Convert Blob to base64
  //     const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.onerror = reject;
  //         reader.onload = () => {
  //             resolve(reader.result);
  //         };
  //         reader.readAsDataURL(blob); // Converts Blob to base64 and calls onload
  //     });

  //     const base64Audio = await convertBlobToBase64(audio) as string

  //     // Assuming the server expects the audio data as a base64 string under the key "audioBase64"
  //     const response = await fetch('http://localhost:3001/diary-entry', {
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //             audioBase64: base64Audio.split(',')[1], // Remove the data URL part (e.g., "data:audio/wav;base64,")
  //             npub: npub,
  //         }),
  //     });

  //     return response.json();
  // }


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