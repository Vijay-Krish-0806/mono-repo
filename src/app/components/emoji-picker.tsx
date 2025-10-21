"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import Picker, { EmojiClickData as EmojiData, Theme } from 'emoji-picker-react';
import { useTheme } from "next-themes";
interface EmojiPickerProps {
    onChange: (value: string) => void;
}
export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
    const { resolvedTheme } = useTheme();
    const handleEmojiSelect = (emoji: EmojiData) => {
        onChange(emoji.emoji);
    };
    const getPickerTheme = () => {
        if (resolvedTheme === "dark") return Theme.DARK;
        if (resolvedTheme === "light") return Theme.LIGHT;
        return Theme.AUTO; 
    };
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
                    <Smile className="h-5 w-5" />
                </button>
            </PopoverTrigger>
            <PopoverContent 
                side="right" 
                sideOffset={40} 
                className="bg-transparent border-none shadow-none drop-shadow-none mb-16 p-0 w-auto">
                <Picker 
                    theme={getPickerTheme()}
                    onEmojiClick={handleEmojiSelect}
                    width={300}
                    height={350}
                    previewConfig={{
                        showPreview: false
                    }}
                    searchDisabled={false}/>
            </PopoverContent> 
        </Popover>
    );
};