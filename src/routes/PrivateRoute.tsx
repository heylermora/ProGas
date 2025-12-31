import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Unauthorized from "components/exceptions/Unauthorized";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user, loading } = useAuth();   // ← usa Firebase

  if (loading) return <div>Cargando...</div>;

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Unauthorized />
      }
    />
  );
};

export default PrivateRoute;