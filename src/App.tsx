import { cn } from "@/lib/utils";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div className="bg-red-500">
      <h1 className={cn("text-2xl font-bold")}>Hello World</h1>
      <Button variant="secondary">Click me</Button>
    </div>
  );
}
