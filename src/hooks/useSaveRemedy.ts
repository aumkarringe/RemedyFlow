import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RemedyToSave {
  name: string;
  healthIssue: string;
  remedy: string;
  yogasan?: string;
  acupressure?: string;
  isAI?: boolean;
}

export function useSaveRemedy() {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveRemedy = async (remedyData: RemedyToSave) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save remedies to your profile",
        variant: "destructive",
      });
      return false;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('saved_remedies').insert({
        user_id: user.id,
        remedy_name: remedyData.name,
        health_issue: remedyData.healthIssue,
        remedy_details: {
          remedy: remedyData.remedy,
          yogasan: remedyData.yogasan,
          acupressure: remedyData.acupressure,
        },
        source: remedyData.isAI ? 'ai' : 'database',
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already saved",
            description: "This remedy is already in your collection",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "✅ Saved to profile",
        description: "Remedy added to your wellness dashboard",
      });
      return true;
    } catch (error) {
      console.error('Error saving remedy:', error);
      toast({
        title: "Error",
        description: "Failed to save remedy. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveRemedy, isSaving, isAuthenticated: !!user };
}
