import { ProcedureInfo } from "@/pages/Project/ProcedureManagement/index.type";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const useAuthPowers = (code: string): boolean => {
  const userinfo = useSelector((state: RootState) => state.app.userinfo);
  if (!userinfo) {
    return false;
  }

  if (userinfo.admin) {
    return true;
  }

  const permissions = JSON.parse(userinfo.permissions);
  return permissions.some((c: string) => c.toString() === code);
};

