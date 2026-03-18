import Link from "next/link";

export default function accountDoesNotExistPage(){

  return (
    <div className="flex items-center justify-center flex-col h-screen py-auto">
      <h1 className="text-3xl">Account does not exist</h1>
      <Link href="/auth/login" className="text-2xl hover:underline"> 	&lt;- Go back to login</Link>
    </div>
  );
}