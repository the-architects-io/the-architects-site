"use client";
import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import {
  useAuthenticationStatus,
  useSignInEmailPassword,
  useSignUpEmailPassword,
} from "@nhost/nextjs";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const { isAuthenticated, isLoading: isLoadingAuth } =
    useAuthenticationStatus();

  const {
    signInEmailPassword,
    needsEmailVerification: signInNeedsEmailVerification,
    isLoading: signInIsLoading,
    isSuccess: signInIsSuccess,
    isError: signInIsError,
    error: signInError,
  } = useSignInEmailPassword();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ email, password }) => {
      let res;

      try {
        res = await signInEmailPassword(email, password);
      } catch (err) {
        console.log(err);
      }

      formik.setValues({ email: "", password: "" });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }

    if (signInIsError) {
      showToast({
        primaryMessage: "Login failed",
        secondaryMessage: signInError?.message,
      });
    }
  }, [
    isAuthenticated,
    router,
    signInError?.message,
    signInIsError,
    signInIsSuccess,
  ]);

  if (isLoadingAuth || isAuthenticated) {
    return (
      <ContentWrapper className="w-full flex justify-center">
        <Spinner />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-8 w-full">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <FormWrapper onSubmit={formik.handleSubmit}>
          <FormInputWithLabel
            label="Email address"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <FormInputWithLabel
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          <div className="w-full flex justify-center">
            <SubmitButton
              isSubmitting={formik.isSubmitting || signInIsLoading}
              onClick={formik.handleSubmit}
            >
              Submit
            </SubmitButton>
          </div>
          <div className="w-full flex justify-center">
            <Link
              href="/signup"
              className="underline cursor-pointer text-center"
            >
              Sign up
            </Link>
          </div>
        </FormWrapper>
      </Panel>
    </ContentWrapper>
  );
}
