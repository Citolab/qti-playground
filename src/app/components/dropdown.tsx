import { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react';

interface Props {
    name: string;
    items: { name: string; items: { name: string, href: string, current: boolean }[] }[];
    onMenuClick: (name: string) => void;
}

export function Dropdown({ items, name, onMenuClick }: Props) {
    return (
        <Menu as="div" className="inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {name}
                    <ChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </MenuButton>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {items.map(i => <div key={i.name} className="py-1">
                        {i.items.map(item => <MenuItem key={`item-${item.name}`}>
                            <span
                                className="block px-4 py-2 text-sm data-[headlessui-state~=active]:bg-gray-100 data-[headlessui-state~=active]:text-gray-900 data-[headlessui-state]:text-gray-700"
                                onClick={() => onMenuClick(item.name)}
                            >
                                {item.name}
                            </span>
                        </MenuItem>
                        )}
                    </div>
                    )}
                </MenuItems>
            </Transition>
        </Menu>
    )
}
