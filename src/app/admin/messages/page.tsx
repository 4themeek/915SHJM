import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getAdminSession } from '@/lib/auth';
import { getAllContactMessages, createContactMessagesTable, markAllMessagesViewed } from '@/lib/db';
import MessagesClient from './MessagesClient';

export default async function AdminMessagesPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  await createContactMessagesTable();
  const messages = await getAllContactMessages();
  await markAllMessagesViewed();

  return <MessagesClient messages={messages} adminEmail={session} />;
}
