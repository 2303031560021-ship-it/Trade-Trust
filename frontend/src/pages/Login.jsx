import { SignIn } from "@clerk/react";

export default function Login() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        afterSignInUrl="/"
      />
    </div>
  );
}