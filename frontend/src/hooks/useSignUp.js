import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api.js";
const useSignUp = () => {
  const queryClient=useQueryClient();

  const {mutate,isPending,error}=useMutation({
    mutationFn: signup,
    onSuccess: ()=>{
      queryClient.invalidateQueries({queryKey:["authUser"]});
      //it asks for refetching the query using queryKey
    }
  })
  return { error, isPending, mutate };
}

export default useSignUp