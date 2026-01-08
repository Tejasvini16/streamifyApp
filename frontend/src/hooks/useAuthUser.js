//custom hook file name should start with "use"
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../lib/api.js"

const useAuthUser = () => {
  //tanstack query
  const {data:authData,isLoading,error}=useQuery({//data is renamed to authData
    queryKey:["authUser"],//will be used when we want to refetch the data from api
    queryFn: getMe,//result gets loaded into -> const "authData"
    retry:false// don't try to fetch from server multiple times if not got at once
  })
  const authUser=authData?.user;// '/me' route returns 'user'
  return {authUser:authUser,isLoading,error};
}

export default useAuthUser