import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono"

export const useGetTasksList = () => {
  const query = useQuery({
    queryKey: ["tasks" ],
    queryFn: async () => {
      const res = await client.tasks.$get();
      
      if(!res.ok){
        throw new Error("Failed to fetch tasks list");
      }

      const data  = await res.json();
      return data;
    },
  });

  return query;
};