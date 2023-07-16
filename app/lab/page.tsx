"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { Panel } from "@/features/UI/panel";
import { useFormik } from "formik";
import { useState } from "react";

export default function Page() {
  const clusterOptions = [
    { label: "Devnet", value: "devnet" },
    { label: "Testnet", value: "testnet" },
    { label: "Mainnet", value: "mainnet-beta" },
  ];
  const [cluseter, setCluster] = useState(clusterOptions[0].value);

  const formik = useFormik({
    initialValues: {
      cluster: clusterOptions[0].value,
    },
    onSubmit: async () => {},
  });

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-2xl mb-4">Lab</h1>
        <SelectInputWithLabel
          value={formik.values.cluster}
          label="Cluster"
          name="cluster"
          options={clusterOptions}
          onChange={(e) => {
            setCluster(e.target.value);
            formik.handleChange(e);
          }}
          onBlur={formik.handleBlur}
          placeholder="Select a cluster"
          hideLabel={false}
        />
      </Panel>
    </ContentWrapper>
  );
}
