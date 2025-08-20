
import { getAllMessages } from "@/lib/dbquery";
import ScrollableMessageHolder from "./MessageScrollHolder";
import { User } from "@/lib/types";

// This tells nextjs to NOT use build-time caching for this page, as we expect frequent updates to chat messages.
export const dynamic = "force-dynamic";


export default async function Messages({ user }: { user: User }) {

  try{
    const messages = await getAllMessages();
    return (
      <ScrollableMessageHolder messages={messages} user={user}/>
    );
  }catch(err:unknown){
    return (<DatabaseError/>)
  }

}


function DatabaseError(){
  return (
  <div role="alert" className="alert alert-error">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>Error! Database failed to load!</span>
</div>)
}

