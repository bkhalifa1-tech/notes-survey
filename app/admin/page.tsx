import {redirect} from "next/navigation";
import {getAuthorizedAdminEmail} from "../../lib/admin-access";
import Admin from "./panel";
export const dynamic="force-dynamic";
export default async function Page(){
 const email=await getAuthorizedAdminEmail();
 if(!email)redirect("/admin/login");
 return <Admin/>;
}
