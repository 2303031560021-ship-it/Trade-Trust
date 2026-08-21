import { SignUp } from "@clerk/react";

export default function Signup() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        afterSignUpUrl="/"
      />
    </div>
  );
}