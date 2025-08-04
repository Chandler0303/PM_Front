import { RootState } from "@/store";
import React, { ReactNode } from "react";
import { useSelector } from "react-redux";

interface AuthWrapperProps {
  code: string; // 权限码
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ code, children }) => {
  const userinfo = useSelector((state: RootState) => state.app.userinfo);

  if (!userinfo) {
    return null;
  }
  // 管理员
  if (userinfo.admin) {
    return <>{children}</>;
  }

  const permissions = JSON.parse(userinfo.permissions);
  const hasPermission = permissions.find((c: string) => c.toString() === code);
  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};

export default AuthWrapper;
