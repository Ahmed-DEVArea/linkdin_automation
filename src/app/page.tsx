'use client';

// ============================================
// Main App — LinkedIn Content Engine
// ============================================

import { useAppStore } from '@/store/useAppStore';
import { TopicInput } from '@/components/TopicInput';
import { IdeasList } from '@/components/IdeasList';
import { PostEditor } from '@/components/PostEditor';

export default function Home() {
  const { step } = useAppStore();

  return (
    <>
      {step === 'input' && <TopicInput />}
      {step === 'ideas' && <IdeasList />}
      {step === 'editor' && <PostEditor />}
      {step === 'saved' && <PostEditor />}
    </>
  );
}
