'use client';

import { hasPermission } from "@/lib/authcheck";
import { MessageRow } from "@/lib/dbquery";
import { User } from "@/lib/types";
import { equalsIgnoreCase, formatDate } from "@/lib/utils";

import Pen from '@/public/icons/pen-square-svgrepo-com.svg';
import Trash from '@/public/icons/trash-can-svgrepo-com.svg';
import { getSession } from "next-auth/react";


export default function Message( {message,user,onDelete,onEdit}:{message:MessageRow, user:User,onDelete: (msg: MessageRow) => void,onEdit: (msg: MessageRow) => void} ) {

    const hasPostEdit= hasPermission(user.roles, "post.edit");
    const hasPostDelete= hasPermission(user.roles, "post.delete");
    const isMessageOwner: boolean = equalsIgnoreCase(message.name, user.name)

    return( 
    <>
        
    <div 
        className={`chat text-left ${(isMessageOwner ? "chat-end" : "chat-start")}`} >

        <div className="chat-header font-bold">
            {isMessageOwner && 
            ( 
                EditDeleteComponents({hasDelete:hasPostDelete,hasEdit:hasPostEdit,message,onDelete,onEdit})
            )
            }
            {message.name}
            <time className="text-xs opacity-50">{formatDate(message.createdAt)}</time>
            {!isMessageOwner && 
            ( 
                EditDeleteComponents({hasDelete:hasPostDelete,hasEdit:hasPostEdit,message,onDelete,onEdit})
            )
        }
        </div>

        <div className="chat-bubble whitespace-pre-wrap">{message.content}</div>
        <div className="chat-footer opacity-50 mt-1">
        
        </div>        
     </div>
     </>
     )
}

function EditDeleteComponents(
    {hasDelete,hasEdit,message,onDelete,onEdit}:{hasEdit:boolean, hasDelete:boolean,message:MessageRow,onDelete: (msg: MessageRow) => void,onEdit: (msg: MessageRow) => void}
) {

    return ( <>
        {hasEdit && 
        <div onClick={()=>onEdit(message)} className="hover:cursor-pointer hover:text-primary" >
            <Pen className="size-3.5"/>
        </div>}
        {hasDelete && 
        <div onClick={()=>onDelete(message)} className="hover:cursor-pointer hover:text-primary" >
            <Trash className="size-3.5"/>
        </div>}
      </>
    )
}