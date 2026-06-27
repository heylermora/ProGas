import React from "react";
import { Route, RouteProps } from "react-router-dom";
import { AppRole, useAuth } from "../contexts/AuthContext";
import Unauthorized from "components/exceptions/Unauthorized";

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  roles?: AppRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  roles,
  ...rest
}) => {
  const { user, loading, hasRole } = useAuth();   // ← usa Firebase

  if (loading) return <div>Cargando...</div>;

  return (
    <Route
      {...rest}
      render={(props) =>
        user && hasRole(roles) ? <Component {...props} /> : <Unauthorized />
      }
    />
  );
};

export default PrivateRoute;
