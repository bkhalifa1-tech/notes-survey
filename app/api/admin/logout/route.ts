import {clearSessionCookie,isSameOrigin} from "../../../../lib/admin-access";
export async function POST(request:Request){if(!isSameOrigin(request))return new Response(null,{status:403});return new Response(null,{status:204,headers:{"Set-Cookie":clearSessionCookie()}})}
