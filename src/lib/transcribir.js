import { base44 } from '@/api/base44Client';

// Sube el audio y lo transcribe. onPaso recibe 'subiendo' | 'transcribiendo'.
export async function transcribirArchivo(file, onPaso = () => {}) {
  onPaso('subiendo');
  const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
  onPaso('transcribiendo');
  const { data } = await base44.functions.invoke('transcribirAudio', { audio_url: file_url });
  return data?.texto || '';
}