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
  useAuthenticated,
  useAuthenticationStatus,
  useSignInEmailPasswordless,
} from "@nhost/nextjs";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  const { isAuthenticated, isLoading: isLoadingAuth } =
    useAuthenticationStatus();

  const { signInEmailPasswordless, isLoading, isSuccess, isError, error } =
    useSignInEmailPasswordless({
      allowedRoles: ["user"],
      metadata: {},
      redirectTo: `${BASE_URL}/me`,
    });
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async ({ email }) => {
      const res = await signInEmailPasswordless(email);
      formik.setValues({ email: "" });
      console.log(res);
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/me");
    }
    if (isSuccess) {
      showToast({
        primaryMessage: "Check your email",
        secondaryMessage: "It might be in your spam folder",
      });
    }
  }, [isAuthenticated, router, isSuccess]);

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
          <div className="w-full flex justify-center">
            <SubmitButton
              isSubmitting={formik.isSubmitting || isLoading}
              onClick={formik.handleSubmit}
            >
              Go
            </SubmitButton>
          </div>
        </FormWrapper>
      </Panel>
    </ContentWrapper>
  );
}
