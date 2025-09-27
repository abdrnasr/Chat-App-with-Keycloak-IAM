'use server'
import { z } from "zod";
import { DeleteMessageById, EditMessageById, PostMessage } from "@/lib/dbquery";


import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/authcheck";
import { User } from "@/lib/types";
import { auth } from "@/auth";

const createFormSchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(1000),
});

export async function PostMessageAction(formData: FormData) {

  const session = await auth();

  if (!session) {
      return {error: "Unauthorized"};
  }

  const usr= session.user as User;

  if(!hasPermission(usr.roles, "post.create")) {
      return {error: "Missing Permissions"};
  }

  const raw = {
    text: formData.get("text"),
  };
  const parsed = createFormSchema.safeParse(raw);

  if (!parsed.success) {
      return {error: "Invalid body"};
  }

  try{
    await PostMessage(usr.dbId as number, parsed.data.text);
  } catch (err:unknown) {
    return {error: "Database Error"}; 
  }

  revalidatePath('/');
}

const messageDeleteScheme = z.number();

export async function DeleteMessage(deleteRequest:unknown) {

  const session = await auth();

  if (!session) {
      return {error: "Unauthorized"};
  }

  const usr= session.user as User;

  if(hasPermission(usr.roles, "post.delete")==false) {
      return {error: "Missing Permissions"};
  }

  const parseRes = messageDeleteScheme.safeParse(deleteRequest);
  if(!parseRes.success){
      return {error: "Data Format Issue"};
  }

  try{
    await DeleteMessageById(parseRes.data);
  } catch (err:unknown) {
    return {error: "Database Error"}; 
  }
  revalidatePath('/');
}


const messageEditScheme = z.object({
  text: z.string().trim().min(1, "Text is required").max(1000),
  messageId: z.number(),
});

export async function EditMessage(updateData:unknown) {

  const session = await auth();

  if (!session) {
      return {error: "Unauthorized"};
  }

  const usr= session.user as User;

  if(hasPermission(usr.roles, "post.edit")==false) {
      return {error: "Missing Permissions"};
  }

  const parseRes = messageEditScheme.safeParse(updateData);
  if(!parseRes.success){
      return {error: "Data Format Issue"};
  }

  try {
    await EditMessageById(parseRes.data.messageId,parseRes.data.text);
     
  } catch (err:unknown) {
    return {error: "Database Error"}; 
  }

  revalidatePath('/');
}

