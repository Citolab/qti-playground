import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Preview Package", href: "/upload" },
  { name: "Upgrade / modify packages", href: "/modify" },
  { name: "Preview item", href: "/preview" },
  { name: "Convert item", href: "/convert" },
];

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fullScreen = searchParams.get("full")?.toLocaleLowerCase() === "true";

  return (
    <div className="bg-gray-100 flex flex-col h-full">
      {!fullScreen ? (
        <nav className="bg-white border-b border-citolab-600 shadow-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div
                  className="shrink-0 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  <img
                    className="block h-16 w-auto"
                    src="/citolab.jpeg"
                    alt="CitoLab"
                  />
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive, isPending }) =>
                          cn(
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isPending
                              ? "text-citolab-600"
                              : isActive
                                ? "bg-citolab-50 text-citolab-700 border-b-2 border-citolab-600"
                                : "text-citolab-600 hover:bg-citolab-50"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-citolab-50 text-citolab-600 hover:bg-citolab-100 hover:text-citolab-700"
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 bg-white">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                        isActive
                          ? "bg-citolab-50 text-citolab-700 border-l-4 border-citolab-500"
                          : "text-citolab-600 hover:bg-citolab-50"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
};
