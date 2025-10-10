
import { getAllMessages } from "@/lib/dbquery";
import ScrollableMessageHolder from "./MessageScrollHolder";
import { User } from "@/lib/types";
import DatabaseError from "./Minicomps/DatabaseErrorComp";

// This tells nextjs to NOT use build-time caching for this page, as we expect frequent updates to chat messages.
export const dynamic = "force-dynamic";

export default async function Messages({ user }: { user: User }) {

  try{
    const messages = await getAllMessages();
    return (
      <ScrollableMessageHolder messages={messages} user={user}/>
    );
  }catch(err:unknown){
    return (<DatabaseError />)
  }
}




