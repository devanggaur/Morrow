import BankConnection from "../BankConnection";

export default function BankConnectionExample() {
  return (
    <BankConnection
      onConnect={() => console.log("Connecting to Plaid...")}
    />
  );
}
