import { FormEvent, RefObject } from 'react';

interface UploadFilesFormUIProps {
  isLoading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  uploadToServer: (event: FormEvent<HTMLFormElement>) => void;
}

export default function UploadFilesFormUI({
  isLoading,
  fileInputRef,
  uploadToServer,
}: UploadFilesFormUIProps) {
  return (
    <form onSubmit={uploadToServer}>
      <div className="mb-4">
        <label htmlFor="file-upload" className="block text-xl font-bold mb-4">
          Select files to upload:
        </label>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="mt-2"
          multiple
          required
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>

      {isLoading && (
        <div className="mt-4">
          <p className="text-gray-500">Uploading files, please wait...</p>
        </div>
      )}
    </form>
  );
}