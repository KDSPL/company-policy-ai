
"use client";

import React, { useState } from "react";
import styles from "./DocumentUpload.module.scss";

type DocumentUploadProps = {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  isUploading: boolean;
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  selectedFile,
  onFileSelect,
  onUpload,
  isUploading,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    onFileSelect(file);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    handleFile(file);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    handleFile(file);
  };

  return (
    <section className={styles.uploadSection}>
      <h2>Upload Documents</h2>

      <div
        className={`${styles.uploadBox} ${
          isDragging ? styles.dragging : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>
          {isDragging
            ? "Drop your document here"
            : "Drag & drop your document here"}
        </p>

        <span>or</span>

        <label className={styles.chooseButton}>
          Choose File

          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile && (
          <div className={styles.selectedFile}>
            <span>📄</span>
            <span>{selectedFile.name}</span>
          </div>
        )}

        {selectedFile && (
          <button
            type="button"
            className={styles.uploadButton}
            onClick={onUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        )}

        <small>
          Supported formats: PDF
        </small>
      </div>
    </section>
  );
};

export default DocumentUpload;
