import {
  Children,
  cloneElement,
  isValidElement,
} from "react";
import useLanguage from "./useLanguage";

const translatedProps = [
  "aria-label",
  "label",
  "descricao",
  "placeholder",
  "title",
  "titulo",
];

function translateNode(node, t) {
  if (typeof node === "string") return t(node);
  if (Array.isArray(node)) return node.map((child) => translateNode(child, t));
  if (!isValidElement(node)) return node;

  const props = {};
  for (const propName of translatedProps) {
    if (typeof node.props[propName] === "string") {
      props[propName] = t(node.props[propName]);
    }
  }
  props.children = Children.map(node.props.children, (child) =>
    translateNode(child, t),
  );
  return cloneElement(node, props);
}

export default function LocalizedContent({ children }) {
  const { t } = useLanguage();
  return translateNode(children, t);
}
