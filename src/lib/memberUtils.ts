
import { supabase } from "./supabaseClient";

export interface Member {
  id?: string;
  name: string;
  email: string;
  total_contribution?: number;
}

export interface Contribution {
  id?: string;
  member_id: string;
  amount: number;
  date: string;
  description?: string;
  week?: string;
}

export const fetchMembers = async (): Promise<Member[]> => {
  console.log("Fetching members...");
  try {
    // Try to use the view that includes total contributions
    const { data: membersWithContributions, error: viewError } = await supabase
      .from('members_with_contributions')
      .select('*');
      
    if (!viewError && membersWithContributions) {
      console.log("Fetched members with contributions:", membersWithContributions);
      return membersWithContributions;
    }
    
    // Fallback to just getting members if the view doesn't exist
    const { data, error } = await supabase
      .from('members')
      .select('*');
      
    if (error) throw error;
    console.log("Fetched members:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

export const addMember = async (name: string, email: string): Promise<Member> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert({ name, email })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

export const updateMember = async (id: string, updates: Partial<Member>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error updating member:", error);
    throw error;
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting member:", error);
    throw error;
  }
};

export const addContribution = async (memberId: string, amount: number, week: string, description?: string): Promise<Contribution> => {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .insert({
        member_id: memberId,
        amount,
        date: new Date().toISOString(),
        week,
        description: description || "Weekly contribution"
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding contribution:", error);
    throw error;
  }
};

export const getCurrentWeek = (): string => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const week = Math.ceil(day / 7);
  return `${now.getFullYear()}-W${week}`;
};

export const formatWeek = (weekStr: string): string => {
  const [year, weekNum] = weekStr.split('-W');
  return `Week ${weekNum}, ${year}`;
};
