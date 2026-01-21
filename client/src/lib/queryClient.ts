import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // If API returns non-OK status, return empty data instead of throwing
      if (!res.ok) {
        console.warn(`[QueryClient] API returned ${res.status} for ${queryKey.join("/")}. Returning empty data.`);
        return null;
      }

      return await res.json();
    } catch (error) {
      // Catch network errors and return empty data instead of crashing
      console.warn(`[QueryClient] Network error for ${queryKey.join("/")}:`, error);
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 min, then refetches
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
