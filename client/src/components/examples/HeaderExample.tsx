import { Header } from "../Header";

export default function HeaderExample() {
  return (
    <Header
      isLoggedIn={false}
      zipcode="20902"
      onSignIn={() => console.log("Sign in clicked")}
    />
  );
}
