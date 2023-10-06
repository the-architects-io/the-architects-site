import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";

export const DispenserSettingsForm = ({
  dispenserId,
  setStep,
}: {
  dispenserId?: string;
  setStep: (step: number) => void;
}) => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      cooldownDays: 0,
      cooldownHours: 0,
      cooldownMinutes: 0,
      hasRecurringPayments: false,
    },
    onSubmit: async ({
      cooldownDays,
      cooldownHours,
      cooldownMinutes,
      hasRecurringPayments,
    }) => {
      if (!hasRecurringPayments) {
        router.push(`/me/dispenser/${dispenserId}`);
        return;
      }

      const cooldownInMs = hasRecurringPayments
        ? cooldownDays * 24 * 60 * 60 * 1000 +
          cooldownHours * 60 * 60 * 1000 +
          cooldownMinutes * 60 * 1000
        : 0;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/update-dispenser`, {
          id: dispenserId,
          cooldownInMs,
        });

        console.log({ data });

        router.push(`/me/dispenser/${dispenserId}`);
      } catch (error) {
        console.log({ error });
        showToast({
          primaryMessage: "Error updating dispenser",
        });
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <h1 className="text-3xl my-4 text-gray-100 text-center w-full">
        Payout Settings
      </h1>

      <div className="text-xl">Payout Cooldown</div>
      <div className="text-gray-400 mb-4 px-4">
        For dispenser with recurring payouts, how long should the cooldown be
        between claims?
      </div>
      <div className="p-4">
        <FormCheckboxWithLabel
          label="Use Recurring Payouts"
          name="hasRecurringPayments"
          value={formik.values.hasRecurringPayments}
          onChange={(e: any) => {
            formik.setFieldValue("hasRecurringPayments", e.target.checked);
          }}
        />
      </div>
      {!!formik.values.hasRecurringPayments && (
        <div className="w-full mb-4 flex">
          <div className="px-4 w-full">
            <FormInputWithLabel
              label="Days"
              name="cooldownDays"
              type="number"
              value={formik.values.cooldownDays}
              onChange={formik.handleChange}
            />
          </div>
          <div className="px-4 w-full">
            <FormInputWithLabel
              label="Hours"
              name="cooldownHours"
              type="number"
              max={23}
              min={0}
              value={formik.values.cooldownHours}
              onChange={formik.handleChange}
            />
          </div>
          <div className="px-4 w-full">
            <FormInputWithLabel
              label="Minutes"
              name="cooldownMinutes"
              type="number"
              max={59}
              min={0}
              value={formik.values.cooldownMinutes}
              onChange={formik.handleChange}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col items-center w-full pt-8">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};
