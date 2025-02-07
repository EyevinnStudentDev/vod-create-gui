'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import UploadFilesFormUI from '../../components/video/upload-form';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue
} from '@nextui-org/table';
import { Button } from '@nextui-org/button';
import {
  FileObject,
  FileUploadRequest,
  FileObjectTranscode,
  PresignedUrlResponse
} from '../lib/types';

// Main Component
export default function Test() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesList, setFilesList] = useState<FileObjectTranscode[]>([]);
  const [filesTranscoded, setFilesTranscoded] = useState<FileObject[]>([]);

  // Fetch existing files in input and output buckets
  useEffect(() => {
    fetchFilesList();
    fetchTranscodedFiles();
  }, []);

  const fetchFilesList = async (): Promise<void> => {
    try {
      const response = await fetch('/api/getFiles');
      const files: FileObjectTranscode[] = await response.json();
      setFilesList(files);
    } catch (error) {
      console.error('Error fetching input files:', error);
    }
  };

  const fetchTranscodedFiles = async (): Promise<void> => {
    try {
      const response = await fetch('/api/getTranscodedFiles');
      const files: FileObject[] = await response.json();
      setFilesTranscoded(files);
    } catch (error) {
      console.error('Error fetching output files:', error);
    }
  };

  const uploadToServer = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!fileInputRef.current || !fileInputRef.current.files) {
      console.error('No files selected');
      return;
    }

    const files = Array.from(fileInputRef.current.files);
    const filesInfo: FileUploadRequest[] = files.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size
    }));
    // Get presigned urls
    try {
      setIsLoading(true);
      const presignedUrls = await getPresignedUrls(filesInfo);
      await handleUpload(files, presignedUrls); // Upload to Minio
      fetchFilesList(); // Refresh files after upload
      const presignedEncore = await getPresignedUrlsEncore(presignedUrls); // Get presigned urls for uploaded files to send to SVT Encore
      const transcodedPresignedUrls = await handleTranscoding(presignedEncore); // Send presigned urls to SVT Encore
      console.log('TRANSCODED URL', transcodedPresignedUrls);
      fetchTranscodedFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // function for generating presigned urls
  const getPresignedUrls = async (
    files: FileUploadRequest[]
  ): Promise<PresignedUrlResponse[]> => {
    try {
      const response = await fetch('/api/presignedUrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(files)
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting presigned URLs:', error);
      throw error;
    }
  };

  // transcoding function using Eyevinns client core SDK
  const handleTranscoding = async (presignedUrls: string[]) => {
    try {
      const response = await fetch('/api/transcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presignedUrls })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcode');
      }

      const data = await response.json();
      console.log(data);
      // get presigned urls for the transcoded files
      const presignedUrlsTranscoded = await getPresignedTranscoded(
        data.results[0].vodUrl
      );
      return presignedUrlsTranscoded;
    } catch (error) {
      console.error('Error during transcoding:', error);
      alert('Transcoding failed. Check the console for details.');
    }
  };

  const uploadMinio = async (
    presignedUrl: PresignedUrlResponse,
    file: File
  ): Promise<Response> => {
    return await fetch(presignedUrl.url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
  };

  // generate presigned urls for sending to SVT encore
  const getPresignedUrlsEncore = async (filesUrls: PresignedUrlResponse[]) => {
    const response = await fetch('/api/presignedEncore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filesUrls)
    });
    const result = await response.json();
    return result;
  };

  // generate presigned urls for transcoded files
  const getPresignedTranscoded = async (files: File) => {
    const response = await fetch('/api/presignedTranscoded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files)
    });
    const result = await response.json();
    return result;
  };

  const handleUpload = async (
    files: File[],
    presignedUrls: PresignedUrlResponse[]
  ): Promise<void> => {
    try {
      const uploadToS3Responses = await Promise.all(
        presignedUrls.map((presignedUrl) => {
          const file = files.find(
            (file) =>
              file.name === presignedUrl.originalFileName &&
              file.size === presignedUrl.fileSize
          );
          if (!file) throw new Error('File not found');
          return uploadMinio(presignedUrl, file);
        })
      );

      if (uploadToS3Responses.some((res) => res.status !== 200)) {
        alert('Upload failed');
        return;
      }
      alert('Upload successful');
      fetchTranscodedFiles();
    } catch (error) {
      console.error('Error handling upload:', error);
      alert('Upload failed. Check the console for details.');
    }
  };

  const deleteFile = async (fileName: string): Promise<void> => {
    try {
      const response = await fetch('/api/deleteFile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName })
      });

      if (response.ok) {
        alert('File deleted successfully');
        fetchFilesList();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete file: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleEmptyBucket = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/emptyBucket', {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        fetchTranscodedFiles();
      } else {
        alert(result.error || 'Failed to empty the bucket');
      }
    } catch (error) {
      console.error('Error emptying bucket:', error);
      alert('An error occurred while emptying the bucket');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'NAME' },
    { key: 'size', label: 'SIZE (bytes)' },
    { key: 'lastModified', label: 'MODIFIED' },
    { key: 'actions', label: 'ACTIONS' }
  ];

  return (
    <main className="flex flex-col items-center w-screen h-screen">
      <h1 className="text-3xl font-bold mb-4">File Upload</h1>

      <UploadFilesFormUI
        isLoading={isLoading}
        fileInputRef={fileInputRef}
        uploadToServer={uploadToServer}
      />

      <div className="mt-8 w-3/4">
        <h2 className="text-2xl font-semibold">Files in Bucket:</h2>
        <Table aria-label="Files in Bucket">
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {filesList.map((row) => (
              <TableRow key={row.name}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === 'actions' ? (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => deleteFile(row.name ?? '')}
                      >
                        Delete
                      </Button>
                    ) : (
                      getKeyValue(row, columnKey)
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8 w-3/4">
        <Button color="danger" onClick={handleEmptyBucket}>
          Empty Output Bucket
        </Button>
        <h2 className="text-2xl font-semibold">Transcoded files in Bucket:</h2>
        <Table aria-label="Transcoded Files in Bucket">
          <TableHeader>
            {columns.map((column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            ))}
          </TableHeader>
          <TableBody>
            {filesTranscoded.map((row) => (
              <TableRow key={row.key}>
                {(columnKey) => (
                  <TableCell>
                    {columnKey === 'actions' ? (
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => deleteFile(row.key ?? '')}
                      >
                        Delete
                      </Button>
                    ) : (
                      getKeyValue(row, columnKey)
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
