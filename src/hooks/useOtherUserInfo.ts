import { UserResponseDto } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

async function fetchUserInfo(phoneNumber: string) {
  const response = await fetch(`/api/users/get-info/${phoneNumber}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.message;
}

export function useOtherUserInfo(phoneNumber: string | undefined) {
  return useQuery({
    queryKey: ['userInfo', phoneNumber],
    queryFn: () => phoneNumber ? fetchUserInfo(phoneNumber) as Promise<UserResponseDto> : null,
    enabled: !!phoneNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}