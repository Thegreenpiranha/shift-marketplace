import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ShiftProfile {
  pubkey: string;
  customBio?: string;
  businessHours?: string;
  shippingInfo?: string;
  preferredPaymentMethods?: string[];
  responseTime?: string;
  location?: string;
  lastActive?: number;
  updatedAt: number;
}

export function useShiftProfile(pubkey: string | undefined) {
  return useQuery({
    queryKey: ['shift-profile', pubkey],
    queryFn: async () => {
      if (!pubkey) return null;
      
      const response = await fetch(`/api/profile?pubkey=${pubkey}`);
      
      if (response.status === 404) {
        return null; // No profile exists yet
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      return data.profile as ShiftProfile;
    },
    enabled: !!pubkey,
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateShiftProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<ShiftProfile> & { pubkey: string }) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      return data.profile as ShiftProfile;
    },
    onSuccess: (data) => {
      // Invalidate and refetch profile query
      queryClient.invalidateQueries({ queryKey: ['shift-profile', data.pubkey] });
    },
  });
}
