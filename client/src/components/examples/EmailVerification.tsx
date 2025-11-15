import EmailVerification from "../EmailVerification";

export default function EmailVerificationExample() {
  return (
    <EmailVerification
      email="devang@morrow.app"
      onVerify={(code) => console.log("Verified with code:", code)}
    />
  );
}
