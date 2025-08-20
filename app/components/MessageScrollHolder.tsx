// app/(whatever)/ClientMessages.tsx
"use client";
import { MessageRow } from "@/lib/dbquery";
import { useCallback, useEffect, useRef } from "react";
import Message from "./Message";
import { DeleteMessage, EditMessage } from "../api/actions/mutations";
import ConfirmDeleteDialog, { ConfirmDeleteDialogHandle, ModalResult } from "./Dialogs/ConfirmDeleteDialogHandle";
import EditDialog from "./Dialogs/EditDialogHandle";
import { User } from "@/lib/types";


export default function ScrollableMessageHolder({
  messages,
  user,
}: {
  messages: MessageRow[];
  user: User;
}) {

  // Scroll-to-bottom on first load
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => (el.scrollTop = el.scrollHeight))
    );
  }, []);


  // Handles Scrolling down to the end of the page when messages are added
  const prevCount = useRef<number>(messages.length);
  useEffect(() => {
    if (messages.length > prevCount.current) {
      const el = boxRef.current;
      if (el) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
          })
        );
      }
    }
    prevCount.current = messages.length;
  }, [messages.length]); // run only when count changes

  const deleteDialog = useRef<ConfirmDeleteDialogHandle>(null);
  const openDeleteModal = useCallback((messageData: MessageRow) => {
    deleteDialog.current?.open(messageData);
  }, []);

  // Handle Message Delete Server Action Responses
  const handleDialogDeleteResult = useCallback(
    async (result: ModalResult, message?: MessageRow) => {
      if (result === "accept" && message) {
        const actionResult = await DeleteMessage(message.id);
        if (actionResult?.error) {
          alert(actionResult.error);
        }
      }
    },
    []
  );

  const editDialog = useRef<ConfirmDeleteDialogHandle>(null);
  const openModalEdit = useCallback((messageData: MessageRow) => {
    editDialog.current?.open(messageData);
  }, []);

  // Handle Message Edit Server Action Responses
  const handleDialogEditResult = useCallback(
    async (result: ModalResult, message: MessageRow,editMessage:string) => {
      if (result === "accept" && message && editMessage) {

        if(message.content === editMessage ){
          return
        }

        if(editMessage.length === 0){
          alert("The message cannot be empty.")
          return
        }

        const actionResult = await EditMessage(
          {
            messageId:message.id,
            text:editMessage
          }
        )

        if (actionResult?.error) {
          alert(actionResult.error);
        }

      }
    },
    []
  );

  return (
    <>
      {/* Confirm Delete Dialog Component - Only appears when invoked */}
      <ConfirmDeleteDialog ref={deleteDialog} onResult={handleDialogDeleteResult} />

      {/* Edit Dialog Component - Only appears when invoked */}
      <EditDialog ref={editDialog} onResult={handleDialogEditResult} />
      <div ref={boxRef} className="h-full overflow-auto">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            user={user}
            onDelete={openDeleteModal} 
            onEdit={openModalEdit}
          />
        ))}
      </div>
    </>
  );
}

 