"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Upload, Check, Copy, X, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define interfaces for type safety
interface FileAsset {
  id: number;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface UploadResponse {
  message: string;
  file: FileAsset;
}

const FileUploadPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileAsset | null>(null);
  const [assets, setAssets] = useState<FileAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/uploads', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Access the 'files' array from the response
        setAssets(data.files || []);  // Use an empty array if 'files' is undefined
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setAssets([]);  // Set to empty array if the fetch fails
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file); // Changed from 'file' to 'image'

    try {
      const response = await fetch('http://localhost:4000/api/admin/upload', {
        method: 'POST',
        credentials: 'include', // Added credentials
        body: formData,
      });

      if (response.status === 201) {
        const data = await response.json() as UploadResponse;
        setUploadedFile(data.file);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        fetchAssets(); // Refresh the assets list
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
};

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a temporary "Copied!" indicator here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const trimFilename = (filename: string) => {
    return filename.replace(/^\d+-\d+-/, '');  // Removes leading digits and hyphens
  };
  

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Public Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <label className="cursor-pointer">
              <span className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                {isUploading ? 'Uploading...' : 'Select File'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Supported files: images, documents, and media
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                    <TableCell className="font-medium">{trimFilename(asset.filename)}</TableCell>
                    <TableCell>{asset.mimetype}</TableCell>
                    <TableCell>{formatFileSize(asset.size)}</TableCell>
                    <TableCell>{formatDate(asset.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(asset.url)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Open file"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Popup */}
      {showSuccess && uploadedFile && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <Alert className="bg-white border-green-500 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <AlertDescription>
                  File uploaded successfully!
                </AlertDescription>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 bg-gray-50 p-2 rounded">
              <input
                type="text"
                value={uploadedFile.url}
                readOnly
                className="flex-1 text-sm bg-transparent"
              />
              <button
                onClick={() => copyToClipboard(uploadedFile.url)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;