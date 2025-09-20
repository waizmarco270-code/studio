
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useImperativeHandle, useRef } from 'react';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    const localRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

    React.useEffect(() => {
      const textarea = localRef.current;
      if (textarea) {
        // Reset height to shrink when text is deleted
        textarea.style.height = 'auto';
        // Set the height to the scroll height to expand with text
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [props.value]);


    return (
      <textarea
        className={cn(
          'flex max-h-48 min-h-[48px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={localRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
