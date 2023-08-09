import { Image } from "@mantine/core";
import { type ReactNode } from "react";

export const possibleCategories: { label: string, value: string, icon: ReactNode }[] = [
    { label: 'Felsefe', value: 'felsefe', icon: <Image src="/brand/react.svg" alt="Felsefe icon" width={15} height={15} /> },
    { label: 'Tıp', value: 'tip', icon: <Image src="/brand/nextjs.svg" alt="Tip icon" width={15} height={15} /> },
    { label: 'Matematik', value: 'matematik', icon: <Image src="/brand/node-js.svg" alt="Matematik icon" width={15} height={15} /> },
    { label: "Yazılım", value: "yazilim", icon: <Image src="/brand/kafka.svg" alt="Yazilim icon" width={15} height={15} /> },
]