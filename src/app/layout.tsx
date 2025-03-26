import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';

const navigation = [
  { name: 'Preview Package', href: '/upload', current: true },
  { name: 'Upgrade / modify packages', href: '/modify', current: false },
  { name: 'Preview item', href: '/preview', current: false },
  { name: 'Convert item', href: '/convert', current: false },
];

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fullScreen = searchParams.get('full')?.toLocaleLowerCase() === 'true';
  return (
    <div className="bg-gray-100 flex flex-col h-full">
      {!fullScreen ? (
        <Disclosure as="nav" className="bg-white border-b border-citolab-600 shadow-sm">
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                      <img
                        className="block h-16 w-auto"
                        src="/citolab.jpeg"
                        alt="Citolab"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive, isPending }) =>
                              `${isPending ? "text-citolab-600" :
                                isActive ? "bg-citolab-50 text-citolab-700 border-b-2 border-citolab-600" :
                                  "text-citolab-600 hover:bg-citolab-50"} 
                              rounded-md px-3 py-2 text-sm font-medium transition-colors`
                            }
                            aria-current={item.current ? 'page' : undefined}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <DisclosureButton className="inline-flex items-center justify-center rounded-md bg-citolab-50 p-2 text-citolab-600 hover:bg-citolab-100 hover:text-citolab-700 focus:outline-none focus:ring-2 focus:ring-citolab-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <X className="block h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Menu className="block h-5 w-5" aria-hidden="true" />
                      )}
                    </DisclosureButton>
                  </div>
                </div>
              </div>

              <DisclosurePanel className="md:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 bg-white">
                  {navigation.map((item) => (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      onClick={() => {
                        navigate(item.href);
                      }}
                      href={item.href}
                      className={`${item.current
                        ? 'bg-citolab-50 text-citolab-700 border-l-4 border-citolab-500'
                        : 'text-citolab-600 hover:bg-citolab-50'
                        } block rounded-md px-3 py-2 text-base font-medium transition-colors`}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </DisclosureButton>
                  ))}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      ) : null}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};