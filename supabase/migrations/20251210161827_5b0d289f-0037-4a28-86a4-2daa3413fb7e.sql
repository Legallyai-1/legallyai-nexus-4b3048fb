-- Add UPDATE and DELETE policies to messages table for proper UX

-- Allow users to update messages they sent (mark as read, etc.)
CREATE POLICY "Users can update own sent messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Allow recipients to mark messages as read
CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Allow users to delete their own sent messages
CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());