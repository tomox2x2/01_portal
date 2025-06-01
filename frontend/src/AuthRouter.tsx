import { Navigate, useNavigate } from "react-router-dom";
import { useAuth,removeAuth } from "./api/useAuth";

type Props = {
    children: React.ReactNode;
};

export const PrivateRoute = ({ children }: Props) => {

    removeAuth()
    const { checked, isAuthenticated } = useAuth();

    if (!checked) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return <Navigate to="/" replace={true}/>;
};

export const PublicRoute = ({ children }: Props) => {

    removeAuth()
    const { checked, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!checked) {
      return <div>Loading...</div>;
    }

    if(isAuthenticated) navigate(1);

    return <>{children}</>;
  };