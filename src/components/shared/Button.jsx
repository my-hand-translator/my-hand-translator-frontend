import { styled } from "../../config/stitches.config";

const Button = styled("button", {
  wordBreak: "keep-all",
  overflowWrap: "break-word",

  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  padding: "5px",

  backgroundColor: "white",
  border: "1px solid rgb(241 243 244)",

  outline: "none",
  borderRadius: "0.5em",

  cursor: "pointer",

  variants: {
    size: {
      small: {
        width: "5em",
        height: "2em",
      },
      medium: {
        width: "7em",
        height: "3em",
      },
      middle: {
        width: "10em",
        height: "4em",
      },
      translationButton: {
        padding: "5px",
        borderRadius: "5px",
        fontSize: "20px",
      },
    },

    bgColor: {
      blue: { backgroundColor: "$blue" },
      lightBlue: { backgroundColor: "$lightBlue" },
      apricot: { backgroundColor: "$apricot" },
      white: { backgroundColor: "$white" },
      red: { backgroundColor: "$red" },
    },

    fontColor: {
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
