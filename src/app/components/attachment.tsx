


import { ArrowLeftCircleIcon } from '@heroicons/react/16/solid';
import { ArrowRightCircleIcon } from '@heroicons/react/16/solid';
import React, { useState } from 'react';

type AttachmentProps = {
  urls: string[]
}



function Attachment({ urls }: AttachmentProps) {

  const [currentAttachment, setCurrentAttachment] = useState<number>(0)

  function convertYouTubeLinkToEmbedURL(youtubeUrl: string): string {
    let videoId = '';
    if (youtubeUrl.includes('youtu.be')) {
        // Shortened URL format
        videoId = youtubeUrl.split('youtu.be/')[1];
    } else {
        // Standard URL format
        const match = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        videoId = match ? match[1] : '';
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    } else {
        console.error('Invalid YouTube URL');
        return '';
    }
}


  if (urls.length === 0) return null


  return (
    <>
      {urls.map((url, i) => {
        if (i !== currentAttachment) return null
        if (url.endsWith('.mp4')) return <video key={url} src={url} className=" max-h-96" controls />
        if (url.includes("www.youtube.com") || url.includes("youtu.be")) {
          console.log(url)
          return <iframe key={url} width="560" height="315" src={convertYouTubeLinkToEmbedURL(url)} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        }
        if (url.endsWith('jpg') || url.endsWith('png') || url.endsWith('jpeg')) {
          return <div key={url}
          className='relative w-full flex justify-start py-2 items-start rounded-md min-h-96'>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentAttachment((currentAttachment + 1) % urls.length)
              }
              }
            ><ArrowRightCircleIcon className={`${urls.length === 1 && 'hidden'} w-10 absolute top-1/2 right-0`} /></button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentAttachment((currentAttachment - 1 + urls.length) % urls.length)
              }
              }
            ><ArrowLeftCircleIcon className={`${urls.length === 1 && 'hidden'} w-10 absolute top-1/2 left-0`} /></button>
            <img key={url} src={url} alt="post image" className="max-h-[30rem] object-contain rounded-md" /> </div>
        }
        else {
          return <a key={url} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} href={url} target="_blank" className=" text-blue-500 underline">{url}</a>
        }
      })
      }
    </>
  )


}


export default Attachment;
