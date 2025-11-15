import PersonalDetailsFlow from "../PersonalDetailsFlow";

export default function PersonalDetailsFlowExample() {
  return (
    <PersonalDetailsFlow
      onComplete={(data) => console.log("Form completed:", data)}
    />
  );
}
