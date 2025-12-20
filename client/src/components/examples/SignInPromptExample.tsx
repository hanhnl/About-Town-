import { SignInPrompt } from "../SignInPrompt";

export default function SignInPromptExample() {
  return (
    <div className="max-w-xl space-y-4">
      <SignInPrompt onSignIn={() => console.log("Sign in clicked")} context="comment" />
      <SignInPrompt onSignIn={() => console.log("Sign in clicked")} context="vote" />
    </div>
  );
}
