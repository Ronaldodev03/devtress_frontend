import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { getUser } from "../api/DevtreeAPI";
import Devtree from "../components/Devtree";
import Loader from "../components/Loader";

const AppLayout = () => {
  const { data, isLoading, isError } = useQuery({
    queryFn: getUser,
    queryKey: ["user"],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loader />;
  if (isError) return <Navigate to={"/auth/login"} />;
  if (data) return <Devtree data={data} />;
};

export default AppLayout;
