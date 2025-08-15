import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders app without crashing", () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});

test("app contains title text", () => {
  const { container } = render(<App />);
  expect(container.textContent).toContain("AI Language Learning");
});
