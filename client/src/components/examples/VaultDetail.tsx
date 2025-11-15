import VaultDetail from "../VaultDetail";

export default function VaultDetailExample() {
  return (
    <VaultDetail
      name="Emergency Fund"
      balance={1250}
      target={5000}
      locked={true}
      onBack={() => console.log("Back clicked")}
    />
  );
}
