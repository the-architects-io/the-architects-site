import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TestPage from "@/app/test/page";

it("renders the h1", () => {
  render(<TestPage />);
  const el = screen.getByText("Test Page");
  expect(el).toBeInTheDocument();
});
