import { Fragment } from "react";
import { formatMentions } from "@/lib/mentions";

interface MentionRendererProps {
  content: string;
  className?: string;
}

export default function MentionRenderer({ content, className }: MentionRendererProps) {
  const parts = formatMentions(
    content,
    (username, key) => (
      <span key={key} className="font-semibold text-primary">
        @{username}
      </span>
    ),
    (text, key) => (
      <Fragment key={key}>
        {text}
      </Fragment>
    )
  );

  return (
    <p className={`whitespace-pre-wrap ${className || ""}`}>
      {parts}
    </p>
  );
}
