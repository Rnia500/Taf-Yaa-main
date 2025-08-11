// Text.jsx
import React from 'react';
import '../styles/Text.css';

function Text({
  children,
  as: Component = 'span',
  variant = 'body',
  color = 'primary-text',
  align = 'left',
  bold = false,
  italic = false,
  underline = false,
  paragraph = false,
  uppercase = false,
  ellipsis = false,
  truncateLines,
  className = '',
  style = {},
  ...rest
}) {
  const classes = [
    'text',
    `text-${variant}`,
    bold && 'text-bold',
    italic && 'text-italic',
    underline && 'text-underline',
    uppercase && 'text-uppercase',
    ellipsis && 'text-ellipsis',
    truncateLines && 'text-line-clamp',
    truncateLines && `text-line-clamp-${truncateLines}`,
    className,
  ].filter(Boolean).join(' ');

  const inlineStyle = {
    ...(color !== 'primary-text' && { color: `var(--color-${color})` }),
    textAlign: align,
    ...(paragraph && { textIndent: '2em' }),
    ...style,
  };

  return (
    <Component className={classes} style={inlineStyle} {...rest}>
      {children}
    </Component>
  );
}

export default Text;
