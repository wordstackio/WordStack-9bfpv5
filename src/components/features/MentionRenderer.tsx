import { Fragment } from "react";
import { formatMentions } from "@/lib/mentions";

interface MentionRendererProps {
  content: string;
  className?: string;
  asFragment?: boolean;
}

export default function MentionRenderer({ content, className, asFragment = false }: MentionRendererProps) {
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

  if (asFragment) {
    return <>{parts}</>;
  }

  return (
    <p className={`whitespace-pre-wrap ${className || ""}`}>
      {parts}
    </p>
  );
}
