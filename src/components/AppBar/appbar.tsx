import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger,
    MenubarTrigger
} from "@/components/ui/menubar";
import React from "react";
import {useTheme} from "next-themes";

export function AppBar(){
    const {setTheme} = useTheme();

    const toggleDarkTheme = () => {
        setTheme("dark");
    }

    const toggleLightTheme = () => {
        setTheme("light");
    }
    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>New Window</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Share</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Print</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Options</MenubarTrigger>
                <MenubarContent>
                    <MenubarSub>
                        <MenubarSubTrigger>Theme</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem
                                onClick={toggleDarkTheme}>Dark <MenubarShortcut>Ctrl+D</MenubarShortcut></MenubarItem>
                            <MenubarItem
                                onClick={toggleLightTheme}>Light <MenubarShortcut>Ctrl+L</MenubarShortcut></MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarMenu>

        </Menubar>
    )
}