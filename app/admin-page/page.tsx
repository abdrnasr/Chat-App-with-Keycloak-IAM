
import { notFound } from "next/navigation";

import { User } from '@/lib/types';
import { auth } from '@/auth';
import SignOutButton from '../components/Minicomps/Signout';
import { hasPermission } from "@/lib/authcheck";
import { getAllUsers, UserTableEntry } from "@/lib/dbquery";
import { bufferToUuid } from "@/lib/utils";

export default async function AdminPage() {

  const user = await auth();

  if (!user) {
    notFound();
  }

  const chatUser= user.user as User
  if (!hasPermission(chatUser.roles, "admin.view")) {
    notFound();
  }

  const usrTableData = await getAllUsers()

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
            <div className="flex-1 min-h-0 flex flex-col space-y-1 text-center overflow-y-scroll">
               <TableElements tableData={usrTableData} />             
            </div>
          </div>
        </main>
      </div>
  );
}

function TableElements({ tableData }: { readonly tableData: readonly UserTableEntry[] }) {

  return(
    <div className="overflow-x-auto">
    <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Database ID</th>
            <th>Username</th>
            <th>UUID</th>
            <th>Create Date</th>
          </tr>
        </thead>
        <tbody>

          {
            tableData.map((usr) => (
              <tr key={usr.id}>
                <th>{usr.id}</th>
                <td>{usr.name}</td>
                <td>{bufferToUuid(usr.keycloak_id)}</td>
                <td>{new Date(usr.created_at).toISOString().split('T')[0]}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}



