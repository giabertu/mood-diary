function getUnit8ArrayFromHex(hex: string){
  const arr = Uint8Array.from(Buffer.from(hex, 'hex'));
  return arr
}

function getHexFromUnit8Array(arr: Uint8Array){
  const hex = Buffer.from(arr).toString('hex');
  return hex
}

export {
  getUnit8ArrayFromHex,
  getHexFromUnit8Array
}