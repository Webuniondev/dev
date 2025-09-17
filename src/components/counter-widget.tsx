"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCounterStore } from "@/lib/store/counter";

export const CounterWidget = () => {
  const count = useCounterStore((s) => s.count);
  const increment = useCounterStore((s) => s.increment);
  const decrement = useCounterStore((s) => s.decrement);
  const reset = useCounterStore((s) => s.reset);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Compteur (Zustand)</CardTitle>
        <CardDescription>Exemple minimal de store client</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{count}</div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={() => decrement(1)} variant="outline">
          -1
        </Button>
        <Button onClick={() => increment(1)}>+1</Button>
        <Button onClick={reset} variant="ghost">
          Réinitialiser
        </Button>
      </CardFooter>
    </Card>
  );
};
