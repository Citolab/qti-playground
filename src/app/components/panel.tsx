import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  actionComponents: JSX.Element[];
  children: JSX.Element | JSX.Element[];
}

export function Panel({ title, actionComponents, children }: Props) {
  return (
    <div className="h-full w-full relative p-4">
      <Card className="h-full overflow-hidden">
        <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0 h-14">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center justify-end gap-2">
            {actionComponents.map((a, i) => (
              <div key={i}>{a}</div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="relative mt-2 px-3 pt-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
