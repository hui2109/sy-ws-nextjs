export default function NullText({text = 'null'}: { text?: string }) {
    return (
        <div className="italic text-gray-300">{text}</div>
    );
}