import { pretty, render } from "@react-email/render";
import React from "react";

export const renderTemplate = async <P>(
  Component: React.JSXElementConstructor<P>,
  Props: P,
): Promise<string> => {
  const Element = React.createElement(Component, Props);
  return await pretty(await render(Element));
};
