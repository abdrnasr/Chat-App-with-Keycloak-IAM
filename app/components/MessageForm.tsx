"use client";

import { PostMessageAction } from "@/app/api/actions/mutations";
import { useState } from "react";

export default function Form() {
  const [text, setText] = useState("");

  // Handles the sending and receiving of "the creation of a new message"
  async function ClientPostMessageAction ( formData: FormData ) {
    setText('');
    const result= await PostMessageAction(formData) as {error:string} ;

    if(result?.error){
      alert(result.error);
    }
    
  }

  return (
    <form className="sticky bt-0 mt-4 flex gap-2 shrink-0"
      action={ClientPostMessageAction} >
      <input
        className="input input-bordered w-full rounded-xl"
        placeholder="Type a message..."
        value={text}
        name="text"
        autoComplete="off"
        required
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary rounded-xl">Send</button>
    </form>
  );
}