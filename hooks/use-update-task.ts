import { InferRequestType,InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.tasks[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.tasks[":id"]["$patch"]>["json"];

interface UpdateTaskPayload {
  id: number;
  name?: string;
  done?: boolean;
  order?: number;
};

export const useUpdateTask = ( ) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.tasks[":id"]["$patch"]({
        json,
        param: { id: json.id },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:["tasks"]});
    },
    onError: () => {
      console.log("task update failed");
    },
  });

  return mutation;  
}