"use client";

import { MessageRow } from "@/lib/dbquery";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type ModalResult = "" | "accept" | "decline";

export type ConfirmDeleteDialogHandle = {
  open: (message: MessageRow) => void;
  close: () => void;
};

type Props = {
  onResult?: (result: ModalResult, message: MessageRow, editMessage: string) => void;
};

const EditDialog = forwardRef<ConfirmDeleteDialogHandle, Props>(
  ({ onResult }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [message, setMessage] = useState<MessageRow | undefined>();
    const [editMessage, setEditMessage] = useState<string>("");
    useImperativeHandle(
      ref,
      () => ({
        open(msg: MessageRow) {
          setMessage(msg);
          setEditMessage(msg.content);
          // ensure state is committed before opening
          requestAnimationFrame(() => dialogRef.current?.showModal());
        },
        close() {
          dialogRef.current?.close();
        },
      }),
      []
    );

    const handleClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
      const result = (e.target as HTMLDialogElement)
        .returnValue as ModalResult; // "", "accept", "decline"
      onResult?.(result, message as MessageRow, editMessage as string);
    };

    return (
      <dialog ref={dialogRef} onClose={handleClose} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Warning!</h3>
          <p className="py-4">
            {message
              ? (
                <span>
                  Editing <strong>{message.name}</strong>&apos;s message:
                </span>
                )
              : "No message selected"}
          </p>
          <input onChange={(e) => setEditMessage(e.target.value)} required type="text" value={editMessage} className="input" />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" value="decline">
                Decline
              </button>
              <button className="btn btn-primary" value="accept">
                Accept
              </button>
            </form>
          </div>
        </div>
      </dialog>
    );
  }
);

EditDialog.displayName = "EditDialog";
export default EditDialog;