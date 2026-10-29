"use client";
import React, { useMemo, useState } from "react";
import { Trash2, Search, X } from "lucide-react";
import styles from "./DocumentList.module.scss";

type DocumentItem = {
  id: string;
  name: string;
  size: string;
  status: string;
  uploadDate: string;
};

type DocumentListProps = {
  documents: DocumentItem[];
  onDelete: (id: string) => void;
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
}) => {
  const [searchText, setSearchText] = useState("");

  // Document selected for deletion
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentItem | null>(null);

  // Search documents by name
  const filteredDocuments = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return documents;
    }

    return documents.filter((document) =>
      document.name.toLowerCase().includes(search)
    );
  }, [documents, searchText]);

  // Open delete confirmation
  const handleDeleteClick = (document: DocumentItem) => {
    setSelectedDocument(document);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedDocument) return;

    onDelete(selectedDocument.id);

    setSelectedDocument(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setSelectedDocument(null);
  };



  return (
    <section className={styles.documentList}>
      <div className={styles.listHeader}>
        <div>
          <h2>Uploaded Documents</h2>

          <p className={styles.totalDocs}>
            {documents.length}
            {documents.length === 1
              ? <span>document</span>
              : <span>documents</span>}
          </p>
        </div>

        {/* Search */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} />

            <input
              type="text"
              placeholder="Search documents by name..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document</th>
              <th>Size</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className={styles.emptyState}
                >
                  No documents uploaded yet.
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className={styles.emptyState}
                >
                  No documents found.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td className={styles.documentName}>
                    📄 {document.name}
                  </td>

                  <td>{document.size}</td>

                  <td>{document.uploadDate}</td>

                  <td>
                    <span className={styles.status}>
                      {document.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() =>
                        handleDeleteClick(document)
                      }
                      aria-label={`Delete ${document.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedDocument && (
        <div
          className={styles.modalOverlay}
          onClick={handleCancelDelete}
        >
          <div
            className={styles.deleteModal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCancelDelete}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className={styles.deleteIcon}>
              <Trash2 size={24} />
            </div>

            <h3>Delete Document?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {selectedDocument.name}
              </strong>
              ?
            </p>

            <p className={styles.warningText}>
              This action cannot be undone.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentList;