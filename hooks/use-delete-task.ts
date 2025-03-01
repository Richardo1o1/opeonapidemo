import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.tasks[":id"]["$delete"]>;

export const useDeleteTask = (id:number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error
  >({
    mutationFn: async () => {
      const response = await client.tasks[":id"]["$delete"]({
        param: { id },
      });
      return response.json() as Promise<ResponseType>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:["tasks"]});
    },
    onError: () => {
      console.log("task delete failed");
    },
  });

  return mutation;
}