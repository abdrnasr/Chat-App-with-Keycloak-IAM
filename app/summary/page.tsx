
import { notFound } from "next/navigation";

import { User } from '@/lib/types';
import { auth } from '@/auth';
import SignOutButton from '../components/Minicomps/Signout';
import { hasPermission } from "@/lib/authcheck";
import { getMessageCount, getUserCount } from "@/lib/dbquery";

export default async function Summary() {

  const user = await auth();

  if (!user) {
    notFound();
  }

  const chatUser= user.user as User
  if (!hasPermission(chatUser.roles, "summary.view")) {
    notFound();
  }

  const [userCount, messageCount] = await Promise.all([
    getUserCount(),
    getMessageCount(),
  ]);


  return (
    <div className="flex h-screen flex-col ">
        {/*Header"*/}
        <div className="navbar shadow-sm bg-base-300">
          <div className="flex-1">
            <button className="btn btn-ghost text-xl"> Welcome <strong>{user?.user?.name}</strong></button>
          </div>

          <div className="flex-none">
            <SignOutButton/>
          </div>
        </div>

        {/*Messages Container"*/}
        <main className="flex-1 h-[100%] overflow-hidden px-2 sm:px-10 md:px-20 py-6">
          <div className="flex h-[100%] min-h-0 flex-col">
            <div className="flex-1 min-h-0 flex flex-col space-y-1 text-center">
                <div className="stats bg-base-100 border-base-300 border">
                    <div className="stat">
                        <div className="stat-title font-bold">User Count</div>
                        <div className="stat-value">{userCount}</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title font-bold">Message Count</div>
                        <div className="stat-value">{messageCount}</div>
                    </div>
                </div>              
            </div>
          </div>
        </main>
      </div>
  );
}



