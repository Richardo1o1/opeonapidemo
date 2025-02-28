import { InferRequestType,InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono"

type ResponseType = InferResponseType<typeof client.tasks.$post>;
type RequestType = InferRequestType<typeof client.tasks.$post>["json"];

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.tasks.$post({json});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey:["tasks"]});
    },
    onError: () => {
      console.log("task create failed");
    },
  });

  return mutation;
}