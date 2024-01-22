"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { getMaxBufferSizeAndMaxDepthForCapacity } from "@/app/blueprint/utils/merkle-trees";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { Panel } from "@/features/UI/panel";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export default function Page() {
  const { ws } = useBlueprint();
  const { cluster } = useCluster();

  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [maxBufferSize, setMaxBufferSize] = useState<number>(0);
  const [isTooBig, setIsTooBig] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      capacity: 1,
    },
    onSubmit: ({ capacity }) => {
      console.log(capacity);
    },
  });

  useEffect(() => {
    if (formik.values.capacity > 1073741824) {
      setIsTooBig(true);
      return;
    } else {
      setIsTooBig(false);
    }
    try {
      const { maxBufferSize, maxDepth } =
        getMaxBufferSizeAndMaxDepthForCapacity(formik.values.capacity);
      setMaxBufferSize(maxBufferSize);
      setMaxDepth(maxDepth);
    } catch (error) {}
  }, [formik.values.capacity, isTooBig]);

  const handleCreateException = () => {
    handleError(new Error("Error thrown from frontend exception!"), {
      message: "This is a test exception",
      stack: "This is a test exception",
    });
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <Panel>
        <div className="text-2xl mb-8 text-center">Merkle Tree Calculator</div>
        <FormInputWithLabel
          label="How many items?"
          type="number"
          name="capacity"
          value={formik.values.capacity}
          onChange={formik.handleChange}
        />
        <div className="flex flex-col space-y-6 items-center justify-center mt-4">
          {isTooBig ? (
            <div className="text-red-500 text-2xl text-center">
              Too big for 1 tree.
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                Max Depth
                <span className="text-stone-100 text-4xl">{maxDepth}</span>
              </div>
              <div className="flex flex-col items-center">
                Max Buffer Size:{" "}
                <span className="text-stone-100 text-4xl">{maxBufferSize}</span>
              </div>
            </>
          )}
        </div>
      </Panel>
    </ContentWrapper>
  );
}
