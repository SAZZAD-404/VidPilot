import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SocialAccount {
  id: string;
  user_id: string | null;
  platform: string | null;
  access_token: string | null;
  page_id: string | null;
  expires_at: string | null;
}

export interface CreateSocialAccountData {
  platform: string;
  access_token: string;
  page_id?: string;
  expires_at?: string;
}

export const useSocialAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAccounts = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("social_accounts")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to fetch social accounts");
      console.error(error);
    } else {
      setAccounts(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const connectAccount = async (accountData: CreateSocialAccountData) => {
    if (!user) {
      toast.error("You must be logged in to connect accounts");
      return null;
    }

    // Check if account already exists
    const existing = accounts.find(
      (acc) => acc.platform === accountData.platform
    );

    const { data, error } = existing
      ? await supabase
          .from("social_accounts")
          .update({
            access_token: accountData.access_token,
            page_id: accountData.page_id || null,
            expires_at: accountData.expires_at || null,
          })
          .eq("id", existing.id)
          .select()
          .single()
      : await supabase
          .from("social_accounts")
          .insert({
            user_id: user.id,
            platform: accountData.platform,
            access_token: accountData.access_token,
            page_id: accountData.page_id || null,
            expires_at: accountData.expires_at || null,
          })
          .select()
          .single();

    if (error) {
      toast.error("Failed to connect account");
      console.error(error);
      return null;
    }

    toast.success(`${accountData.platform} connected successfully!`);
    await fetchAccounts();
    return data;
  };

  const disconnectAccount = async (id: string) => {
    if (!user) return false;

    const { error } = await supabase.from("social_accounts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to disconnect account");
      console.error(error);
      return false;
    }

    toast.success("Account disconnected!");
    await fetchAccounts();
    return true;
  };

  const getAccountByPlatform = (platform: string): SocialAccount | undefined => {
    return accounts.find((acc) => acc.platform === platform);
  };

  return {
    accounts,
    isLoading,
    fetchAccounts,
    connectAccount,
    disconnectAccount,
    getAccountByPlatform,
  };
};
