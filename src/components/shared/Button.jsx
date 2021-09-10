import { styled } from "../../config/stitches.config";

const Button = styled("button", {
  border: "none",

  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",

  background: "$lightBlue",

  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  outline: "none",
  borderRadius: "0.5em",

  cursor: "pointer",

  variants: {
    size: {
      small: {
        width: "5em",
        height: "2em",
      },
      midium: {
        width: "7em",
        height: "3em",
      },
      middle: {
        width: "10em",
        height: "4em",
      },
    },

    color: {
      blue: { color: "$blue" },
      lightBlue: { color: "$lightBlue" },
      apricot: { color: "$apricot" },
      white: { color: "$white" },
    },

    active: {
      true: { background: "$lightBlue" },
      false: { background: "$black" },
    },
  },
});

export default Button;
