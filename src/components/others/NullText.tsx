import {useAppContext} from "@/components/hooks/AppProvider";

export default function NullText({text = 'null'}: { text?: string }) {
    const {resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';

    return (
        <div className={`italic ${isDark ? 'text-gray-500' : 'text-gray-300'}`}>{text}</div>
    );
}