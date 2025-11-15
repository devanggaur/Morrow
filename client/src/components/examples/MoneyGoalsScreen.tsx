import MoneyGoalsScreen from "../MoneyGoalsScreen";

export default function MoneyGoalsScreenExample() {
  return (
    <MoneyGoalsScreen
      onNext={(goals) => console.log("Selected goals:", goals)}
    />
  );
}
