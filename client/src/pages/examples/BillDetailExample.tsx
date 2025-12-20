import BillDetail from "../BillDetail";

export default function BillDetailExample() {
  return <BillDetail isLoggedIn={true} onSignIn={() => console.log("Sign in clicked")} />;
}
