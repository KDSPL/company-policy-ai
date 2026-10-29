
"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import styles from "./RecentChats.module.scss";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ChatHistory = {
  id: string;
  title: string;
  question: string;
  time: string;
  answer: string;
};

const RecentChats: React.FC = () => {
  const [recentChats, setRecentChats] = useState<
    ChatHistory[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<
    string[]
  >([]);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  // ==========================================
  // Fetch chat history
  // ==========================================

  const fetchChatHistory = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/chat-history",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch chat history"
        );
      }

      const data = await response.json();

      setRecentChats(data.chats || []);
    } catch (error) {
      console.error(
        "Failed to fetch chat history:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // Initial load
  // ==========================================

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // ==========================================
  // Select chat
  // ==========================================

  const handleChatSelect = (chatId: string) => {
    if (deleteMode) {
      return;
    }

    router.push(`/chat?chatId=${chatId}`);
  };

  // ==========================================
  // Checkbox
  // ==========================================

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    chatId: string
  ) => {
    event.stopPropagation();

    setSelectedChats((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter(
          (id) => id !== chatId
        );
      }

      return [...prev, chatId];
    });
  };

  // ==========================================
  // Toggle delete mode
  // ==========================================

  const handleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
    setSelectedChats([]);
  };

  // ==========================================
  // Delete selected chats
  // ==========================================

  const handleDeleteSelected = async () => {
    if (selectedChats.length === 0) {
      return;
    }

    try {
      setDeleting(true);

      await Promise.all(
        selectedChats.map(async (chatId) => {
          const response = await fetch(
            `/api/chat-history/${chatId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const data =
              await response
                .json()
                .catch(() => null);

            throw new Error(
              data?.message ||
              `Failed to delete chat: ${chatId}`
            );
          }
        })
      );

      setSelectedChats([]);
      setDeleteMode(false);

      // Reload history after deletion
      await fetchChatHistory();
    } catch (error) {
      console.error(
        "Failed to delete chats:",
        error
      );

      alert(
        "Failed to delete selected chats. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className={styles.recentChat}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>
          Chat History
        </h2>

        {recentChats.length > 0 && (
          <>
            {!deleteMode ? (
              <button
                type="button"
                className={
                  styles.deleteChatButton
                }
                onClick={handleDeleteMode}
              >
                <Trash2 size={16} />
                <span>Delete Chat</span>
              </button>
            ) : (
              <div
                className={
                  styles.deleteActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={handleDeleteMode}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    styles.deleteSelectedButton
                  }
                  onClick={
                    handleDeleteSelected
                  }
                  disabled={
                    selectedChats.length ===
                    0 || deleting
                  }
                >
                  <Trash2 size={16} />

                  <span>
                    {deleting
                      ? "Deleting..."
                      : `Delete${selectedChats.length >
                        0
                        ? ` (${selectedChats.length})`
                        : ""
                      }`}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.chatDetails}>
        {loading ? (
          <p>Loading chats...</p>
        ) : recentChats.length === 0 ? (
          <p>No chat history</p>
        ) : (
          recentChats.map((chat) => (
            <div
              key={chat.id}
              className={styles.chatItem}
              // onClick={() =>
              //   handleChatSelect(chat.id)
              // }
            >
              {deleteMode && (
                <input
                  type="checkbox"
                  checked={selectedChats.includes(
                    chat.id
                  )}
                  onChange={(event) =>
                    handleCheckboxChange(
                      event,
                      chat.id
                    )
                  }
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                />
              )}

              <div
                className={styles.chatContent}
              >
                <p
                  className={styles.question}
                >
                  {chat.question}
                </p>

                <p className={styles.answer}>
                  {chat.answer}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default RecentChats;

