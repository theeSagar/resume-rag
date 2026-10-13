export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-tile-2 px-4 py-2.5 text-sm leading-relaxed text-fg">
        {content}
      </p>
    </div>
  );
}
