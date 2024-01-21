"use client";

import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndCard } from "@/features/UI/dnd-card";
import axios from "axios";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { useRouter } from "next/navigation";
import { handleError } from "@/utils/errors/log-error";

export type DispenserResponse = {
  id: string;
  name: string;
  imageUrl: string;
};

type SortedReward = {
  id: string;
  payoutSortOrder: number;
  mint: string;
  isSelected: boolean;
  decimals: number;
  rewardAmount: number;
  payoutChance: number;
  amount: number;
  name: string;
  imageUrl: string;
};

const sortOrderOptions = [
  {
    label: "Random",
    value: "random",
  },
  {
    label: "Sorted",
    value: "sorted",
  },
];

export const DispenserPayoutStructureForm = ({
  dispenserId,
  setStep,
}: {
  dispenserId: string;
  setStep: (step: number) => void;
}) => {
  const { dispenser, rewards } = useDispenser(dispenserId);
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      sortOrder: sortOrderOptions[0].value,
      sortedRewards: [] as SortedReward[],
    },
    onSubmit: async (values) => {
      const shouldClearSortOrder =
        values.sortOrder === sortOrderOptions[0].value;

      try {
        const { data } = await axios.post<DispenserResponse>(
          "/api/update-dispenser-rewards",
          {
            rewards: values.sortedRewards.map(({ id, payoutSortOrder }) => ({
              id,
              payoutSortOrder: shouldClearSortOrder ? null : payoutSortOrder,
            })),
          }
        );
        showToast({
          primaryMessage: "Successfully updated rewards",
        });
        setStep(3);
      } catch (error) {
        showToast({
          primaryMessage: "Error updating rewards",
        });
        handleError(error as Error);
      }
    },
  });

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      formik.setFieldValue(
        "sortedRewards",
        formik.values.sortedRewards.map((reward, index) => {
          if (index === dragIndex) {
            return { ...reward, payoutSortOrder: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...reward, payoutSortOrder: dragIndex };
          }
          return reward;
        })
      );
    },
    [formik]
  );

  useEffect(() => {
    if (rewards && formik.values.sortedRewards.length === 0) {
      // if every reward has a payoutSortOrder set sortOrder to sorted
      if (
        rewards.every((reward) => {
          return reward.payoutSortOrder !== null;
        })
      ) {
        formik.setFieldValue("sortOrder", "sorted");
      }
      formik.setFieldValue(
        "sortedRewards",
        rewards
          .sort((a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0))
          .map((reward, index) => ({
            imageUrl: reward.imageUrl,
            payoutSortOrder: reward?.payoutSortOrder || index,
            mint: reward.token?.mintAddress,
            decimals: reward.token?.decimals,
            amount: reward.amount,
            name: reward.name,
            id: reward.id,
          }))
      );
    }
  }, [formik, rewards]);

  return (
    <>
      <h1 className="text-3xl my-4 text-gray-100">Reward Payout Order</h1>
      <FormWrapper onSubmit={formik.handleSubmit} className="w-full">
        <div className="w-full mb-4">
          <SelectInputWithLabel
            className="w-full"
            value={formik.values.sortOrder}
            label="Sort Order"
            name="sortOrder"
            options={sortOrderOptions}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Random or Sorted"
            hideLabel={false}
            disabled={formik.values.sortedRewards.length <= 1}
          />
        </div>
        {formik.values.sortedRewards.length <= 1 && (
          <p className="text-gray-100 text-center max-w-xs italic mx-auto">
            The dispenser must have at least 2 rewards to enable sorting.
          </p>
        )}
        {formik.values.sortOrder === "sorted" && (
          <>
            <DndProvider backend={HTML5Backend}>
              {formik.values.sortedRewards
                .sort((a, b) => a.payoutSortOrder - b.payoutSortOrder)
                .map(({ id, name, imageUrl }, index) => (
                  <DndCard key={id} id={id} index={index} moveCard={moveCard}>
                    <div className="flex items-center overflow-hidden space-x-4">
                      <ImageWithFallback
                        src={imageUrl}
                        alt={imageUrl}
                        width={100}
                        height={100}
                      />
                      <div className="truncate text-xl">{name}</div>
                    </div>
                  </DndCard>
                ))}
            </DndProvider>
          </>
        )}
        <div className="flex justify-center w-full pt-4">
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            onClick={formik.handleSubmit}
            buttonText="Continue"
            disabled={!formik.isValid || formik.isSubmitting}
          />
        </div>
      </FormWrapper>
    </>
  );
};
