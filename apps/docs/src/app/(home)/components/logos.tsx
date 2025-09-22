export const Logos = () => {
  return (
    <section className="rounded-3xl bg-[#f6f7fa] px-8 py-20">
      <div className="mx-auto h-full max-w-5xl">
        <div className="mx-auto flex w-full max-w-5xl flex-col justify-between gap-10 lg:flex-row">
          <div className="mx-auto max-w-[200px] text-gray-400 text-sm lg:ms-0">
            Integrate with your existing AI tools to enhance your content
            creation workflow.
          </div>
          <ul className="flex flex-row flex-wrap items-center justify-center gap-5">
            <li className="flex items-center gap-1">
              <img
                alt="Cursor AI logo"
                className="max-w-[100px] grayscale"
                height={24}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/cursor.svg"
                width={24}
              />
              <img
                alt="Cursor AI logo"
                className="max-w-[100px] grayscale"
                height={48}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/cursor-text.svg"
              />
            </li>
            <li className="flex items-center gap-1">
              <img
                alt="Claude AI logo"
                className="max-w-[100px] grayscale"
                height={24}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude.svg"
                width={24}
              />
              <img
                alt="Claude AI logo"
                className="max-w-[100px] grayscale"
                height={48}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude-text.svg"
              />
            </li>
            <li className="flex items-center gap-1">
              <img
                alt="OpenAI logo"
                className="max-w-[100px] grayscale"
                height={24}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai.svg"
                width={24}
              />
              <img
                alt="OpenAI logo"
                className="max-w-[100px] grayscale"
                height={48}
                src="https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai-text.svg"
              />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
