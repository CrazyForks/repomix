import JSZip from 'jszip';

export function useZipProcessor() {
  async function createZipFromFiles(files: File[], folderName: string): Promise<File> {
    try {
      const zip = new JSZip();

      for (const file of files) {
        const path = file.webkitRelativePath || file.name;
        zip.file(path, file);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return new File([zipBlob], `${folderName}.zip`, { type: 'application/zip' });
    } catch (error) {
      throw new Error(`Failed to create ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function validateZipFile(file: File): { valid: boolean; error?: string } {
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      return { valid: false, error: 'Please upload a ZIP file' };
    }
    return { valid: true };
  }

  return {
    createZipFromFiles,
    validateZipFile,
  };
}
