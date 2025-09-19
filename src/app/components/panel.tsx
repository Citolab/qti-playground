import { JSX } from "react";

interface Props {
  title: string;
  actionComponents: JSX.Element[];
  children: JSX.Element | JSX.Element[];
}

export function Panel({ title, actionComponents, children }: Props) {
  return (
    <div className="h-full w-full relative p-4">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow">
        <div className="p-4 py-5 sm:p-6 w-full flex items-center justify-between h-14">
          <div className="text-lg font-semibold leading-6 text-gray-900">
            {title}
          </div>
          <div className="flex items-center justify-end gap-2">
            {actionComponents.map((a, i) => {
              return (
                <div key={i} className="">
                  {a}
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative mt-5 mx-3">{children}</div>
      </div>
    </div>
  );
}
