// File: components/FileDropzone.tsx
"use client";

import React from "react";

interface FileDropzoneProps {
  files: File[];
  previews: string[];
  onFilesChange: (files: File[]) => void;
  onPreviewsChange: (previews: string[]) => void;
  onRemoveFile: (index: number) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  files,
  previews,
  onFilesChange,
  onPreviewsChange,
  onRemoveFile,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const updatedFiles = [...files, ...selectedFiles];
    onFilesChange(updatedFiles);

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    onPreviewsChange([...previews, ...newPreviews]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const updatedFiles = [...files, ...droppedFiles];
    onFilesChange(updatedFiles);

    const newPreviews = droppedFiles.map((file) => URL.createObjectURL(file));
    onPreviewsChange([...previews, ...newPreviews]);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    }
    const updatedFiles = [...files, ...pastedFiles];
    onFilesChange(updatedFiles);

    const newPreviews = pastedFiles.map((file) => URL.createObjectURL(file));
    onPreviewsChange([...previews, ...newPreviews]);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      id="dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={triggerFileInput}
      onPaste={handlePaste}
      className="flex flex-col items-center justify-center w-[80%] md:w-[50%]
                 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer
                 bg-transparent hover:bg-[#fafafa]
                 p-4 h-auto max-h-[50vh] min-h-[200px] overflow-y-auto relative"
    >
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {files.length === 0 ? (
        <span className="text-gray-500 text-lg">
          Drag &amp; drop your files here or click to upload
        </span>
      ) : (
        <div className="flex flex-col gap-4 w-full mt-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="border p-3 px-5 rounded-md shadow-md bg-white flex flex-col items-start w-fit"
            >
              <div className="flex w-full justify-between items-center">
                <p className="font-bold text-sm px-4">{file.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="text-red-600 font-semibold"
                >
                  ✖
                </button>
              </div>
              {previews[index] && (
                <div className="w-full mt-2 flex justify-center">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={previews[index] || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-24 object-cover rounded-md"
                    />
                  ) : file.type === "application/pdf" ? (
                    <iframe
                      src={`${previews[index]}#page=1&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0`}
                      title="PDF Preview"
                      className="pdf-preview w-full border rounded-md
                                 [&::-webkit-scrollbar]:hidden scrollbar-none"
                      style={{ height: "100px", overflow: "hidden" }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      Unsupported file type
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
