
import { Suspense } from 'react';

import MessageForm from '@/app/components/MessageForm';
import { redirect } from "next/navigation";
import MessagesServerFetcher  from './components/MessagesServerFetcher';

import SignOutButton from './components/Minicomps/Signout';
import { User } from '@/lib/types';
import { auth } from '@/auth';
import Loading from './components/Minicomps/Loading';

export default async function Home({}) {

  const user = await auth();

  if (!user) {
    redirect("/api/auth/signin");
  }

  return (
    <>
      <div className="flex h-screen flex-col ">
        {/*Header"*/}
        <div className="navbar shadow-sm bg-base-300">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl"> Welcome <strong>{user?.user?.name}</strong></a>
          </div>

          <div className="flex-none">
            <SignOutButton/>
          </div>
        </div>

        {/*Messages Container"*/}
        <main className="flex-1 h-[100%] overflow-hidden px-2 sm:px-10 md:px-20 py-6">
          <div className="flex h-[100%] min-h-0 flex-col">
            <div className="flex-1 min-h-0 flex flex-col space-y-1 text-center">
              <Suspense fallback={<Loading/>}>
                
                <MessagesServerFetcher user={user.user as User} />
              </Suspense>

            </div>
            {/*Text Input Box"*/}
            <MessageForm />
          </div>
        </main>
      </div>
    </>
  );
}



