'use client'
import { signOut } from "next-auth/react";

export default function SignOutButton(){

    return (
        <button  onClick={() => signOut()} className="btn btn-ghost hover:bg-base-100">Sign Out</button>
    )
}