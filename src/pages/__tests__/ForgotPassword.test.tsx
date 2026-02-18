import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "@/pages/ForgotPassword";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/assets/bfp-logo.png", () => ({ default: "logo.png" }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

describe("ForgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the form with correct title and subtitle", () => {
    renderPage();
    expect(screen.getByText("Forgot Password")).toBeInTheDocument();
    expect(screen.getByText("Reset your password securely")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("Cancel button navigates back to login", () => {
    renderPage();
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Email format validation
  it.each([
    "plaintext",
    "missing@",
    "@nodomain.com",
    "spaces in@email.com",
    "no-dot@domaincom",
  ])("rejects invalid email format: %s", async (invalidEmail) => {
    renderPage();
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: invalidEmail } });
    fireEvent.submit(screen.getByText("Submit"));
    expect(await screen.findByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  // Domain validation
  it("rejects valid format but unknown domain", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "user@fakemail123.xyz" } });
    fireEvent.submit(screen.getByText("Submit"));
    expect(await screen.findByText("Email domain is not valid.")).toBeInTheDocument();
  });

  it.each(["gmail.com", "yahoo.com", "outlook.com", "protonmail.com"])(
    "accepts known domain: %s",
    async (domain) => {
      renderPage();
      const input = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(input, { target: { value: `user@${domain}` } });
      fireEvent.submit(screen.getByText("Submit"));
      // Should NOT show domain error
      await waitFor(() => {
        expect(screen.queryByText("Email domain is not valid.")).not.toBeInTheDocument();
        expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
      });
    }
  );

  it("accepts .gov/.edu/.org domains", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "user@agency.gov.ph" } });
    fireEvent.submit(screen.getByText("Submit"));
    await waitFor(() => {
      expect(screen.queryByText("Email domain is not valid.")).not.toBeInTheDocument();
    });
  });

  // Success flow
  it("shows success message for valid email", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "chief@gmail.com" } });
    fireEvent.submit(screen.getByText("Submit"));
    expect(
      await screen.findByText(/A password reset link has been sent to/)
    ).toBeInTheDocument();
    expect(screen.getByText("chief@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Back to Login")).toBeInTheDocument();
  });

  it("Back to Login navigates to / after success", async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "chief@gmail.com" },
    });
    fireEvent.submit(screen.getByText("Submit"));
    const backBtn = await screen.findByText("Back to Login");
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("clears error when user types after an error", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "bad" } });
    fireEvent.submit(screen.getByText("Submit"));
    expect(await screen.findByText("Please enter a valid email address.")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "b" } });
    expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
  });
});
