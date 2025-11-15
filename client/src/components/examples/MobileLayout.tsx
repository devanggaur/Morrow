import MobileLayout from "../MobileLayout";

export default function MobileLayoutExample() {
  return (
    <MobileLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Mobile Layout</h1>
        <p className="text-muted-foreground">
          This layout wraps content in a 390×844 iPhone-sized frame
        </p>
      </div>
    </MobileLayout>
  );
}
