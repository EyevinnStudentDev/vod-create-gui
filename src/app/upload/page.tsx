'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import UploadFilesFormUI from '../../components/video/upload-form';
import { Context } from '@osaas/client-core';
import { createVod, createVodPipeline } from '@osaas/client-transcode';
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
import { IconAlertTriangle } from '@tabler/icons-react';

// ADD ERROR HANDELING FOR API ROUTE CALLS
export default function Test() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [filesTranscoded, setfilesTranscoded] = useState<any[]>([]);

  // fetch existing files in input and output bucket
  useEffect(() => {
    fetchFilesList();
    fetchTranscodedfiles();
  }, []);

  // function to fetch input files
  const fetchFilesList = async () => {
    try {
      const response = await fetch('/api/getFiles');
      const files = await response.json();

      setFilesList(files);
    } catch (error) {
      console.error('Error fetching input files:', error);
    }
  };

  // function to fetch output files
  const fetchTranscodedfiles = async () => {
    try {
      const response = await fetch('/api/getTranscodedFiles');
      const files = await response.json();
      setfilesTranscoded(files);
    } catch (error) {
      console.error('Error fetching output files:', error);
    }
  };

  // form upload function
  const uploadToServer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileInputRef.current || !fileInputRef.current.files) {
      throw new Error('No files selected');
    }
    const files = Object.values(fileInputRef.current.files);
    const filesInfo: any[] = files.map((file) => ({
      originalFileName: file.name,
      fileSize: file.size
    }));

    // get presigned urls for the files
    const presignedUrls = await getPresignedUrls(filesInfo);
    await handleUpload(files, presignedUrls);

    setIsLoading(false);
    fetchFilesList(); // refresh file list after upload
  };
  // generate presigned urls for upload
  const getPresignedUrls = async (files: any) => {
    const response = await fetch('/api/presignedUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files)
    });
    const result = await response.json();
    return result;
  };
  // upload to minio
  const uploadMinio = async (presignedUrl: any, file: File) => {
    return await fetch(presignedUrl.url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type, 'Access-Control-Allow-Origin': '*' }
    });
  };

  // generate presigned urls for sending to SVT encore
  const getPresignedUrlsEncore = async (files: any) => {
    const response = await fetch('/api/presignedEncore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files)
    });
    const result = await response.json();
    return result;
  };
  // main upload function
  const handleUpload = async (files: File[], presignedUrls: any[]) => {
    const uploadToS3Response = await Promise.all(
      presignedUrls.map((presignedUrl: any) => {
        const file = files.find(
          (file) =>
            file.name === presignedUrl.originalFileName &&
            file.size === presignedUrl.fileSize
        );
        if (!file) throw new Error('File not found');
        return uploadMinio(presignedUrl, file);
      })
    );

    if (uploadToS3Response.some((res) => res.status !== 200)) {
      alert('Upload failed');
      return;
    }
    alert('Upload successful');

    const presignedEncore = await getPresignedUrlsEncore(presignedUrls);

    const transcodedPresignedUrls = await handleTranscoding(presignedEncore);
    // refresh list after upload
    fetchTranscodedfiles();
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
      //alert('Transcoding completed successfully!');
      // get presigned urls for the transcoded files
      const presignedUrlsTranscoded = await getPresignedTranscoded(
        data.results[0].vodUrl
      );
      //alert('Presigned urls fetched!');
      // refresh transcoded files list
      fetchTranscodedfiles();
    } catch (error) {
      console.error('Error during transcoding:', error);
      alert('Transcoding failed. Check the console for details.');
    }
  };

  // generate presigned urls for transcoded files
  const getPresignedTranscoded = async (files: any) => {
    const response = await fetch('/api/presignedTranscoded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files)
    });
    const result = await response.json();
    return result;
  };

  // delete file from minIO
  const deleteFile = async (fileName: string) => {
    try {
      const response = await fetch('/api/deleteFile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName
        })
      });

      if (response.ok) {
        alert('File deleted successfully');
        fetchFilesList(); // refresh list after deletion
      } else {
        const errorData = await response.json();
        alert(`Failed to delete file: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  // FUNCTION TO EMPTY OUTPUT BUCKET ONLY FOR DEBUGGING
  const handleEmptyBucket = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/emptyBucket', {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        // update transcoded files array after deleting
        fetchTranscodedfiles();
      } else {
        alert(result.error || 'Failed to empty the bucket');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while emptying the bucket');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'key', label: 'NAME' },
    { key: 'size', label: 'SIZE (bytes)' },
    { key: 'lastModified', label: 'MODIFIED' },
    { key: 'actions', label: 'ACTIONS' }
  ];

  return (
    <main className="flex flex-col items-center w-screen h-screen">
      <h1 className="text-3xl font-bold mb-4">File Upload</h1>

      {/* Upload Form */}
      <UploadFilesFormUI
        isLoading={isLoading}
        fileInputRef={fileInputRef}
        uploadToServer={uploadToServer}
      />

      {/* Display Files List */}
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
              <TableRow key={row.key}>
                {(columnKey) => {
                  if (columnKey === 'actions') {
                    return (
                      <TableCell>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => deleteFile(row.key)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    );
                  }
                  return <TableCell>{getKeyValue(row, columnKey)}</TableCell>;
                }}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Display Output Files List */}
      <div className="mt-8 w-3/4">
        {/* BUTTON FOR EMPTYING OUTPUT BUCKET DEBUGG */}
        <Button color="danger" onClick={handleEmptyBucket}>
          {' '}
          Empty Output Bucket
        </Button>
        {/* BUTTON FOR EMPTYING OUTPUT BUCKET DEBUGG */}
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
                {(columnKey) => {
                  if (columnKey === 'actions') {
                    return (
                      <TableCell>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => deleteFile(row.key)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    );
                  }
                  return <TableCell>{getKeyValue(row, columnKey)}</TableCell>;
                }}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
